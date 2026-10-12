import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import menu from "../src/data/menu.json";
import { validateMenuData } from "../src/lib/menu-schema";
import { normalizePhone } from "../src/lib/phone";

// Entirely isolated filesystem, fake admin credentials, no outbound mail,
// no Telegram credentials and no GitHub requests/writes.
const root = mkdtempSync(join(tmpdir(), "nilov-api-tests-"));
const apiDir = resolve(import.meta.dir, "../public/api");
let server: ReturnType<typeof Bun.spawn> | undefined;
let base = "";
let cookie = "";

function php(code: string, input = ""): string {
  const result = spawnSync("php", ["-d", "sendmail_path=/bin/false", "-r", code], { input, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "PHP failed");
  return result.stdout;
}

async function request(path: string, body?: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", Origin: "http://127.0.0.1:3005", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { response, status: response.status, body: JSON.parse(text) };
}

beforeAll(async () => {
  cpSync(apiDir, join(root, "api"), { recursive: true });
  mkdirSync(join(root, "config"));
  mkdirSync(join(root, "server-data"));
  writeFileSync(join(root, "index.html"), "<h1>Local test fixture</h1>");
  const hash = php('echo password_hash("local-test-password", PASSWORD_BCRYPT);');
  const secrets = Buffer.from(JSON.stringify({ hmac_key: "local-test-key-".repeat(8), password_hash_default: hash })).toString("base64");
  writeFileSync(join(root, "config/secrets.php"), `<?php return json_decode(base64_decode('${secrets}'), true);`);
  const listener = Bun.serve({ port: 0, fetch: () => new Response() });
  const port = listener.port;
  listener.stop(true);
  base = `http://127.0.0.1:${port}`;
  server = Bun.spawn(["php", "-d", "sendmail_path=/bin/false", "-S", `127.0.0.1:${port}`, "-t", root, join(root, "api/router.php")], { stdout: "ignore", stderr: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) return; } catch { /* wait for startup */ }
    await Bun.sleep(100);
  }
  throw new Error("Local PHP server did not start");
});

afterAll(() => {
  server?.kill();
  rmSync(root, { recursive: true, force: true });
});

describe("PHP API contracts", () => {
  test("lead endpoint rejects GET without storing or notifying", async () => {
    expect((await request("/api/lead.php")).status).toBe(405);
  });
  test("private files and encoded paths are blocked", async () => {
    for (const path of ["/config/secrets.php", "/%63onfig/secrets.php", "/server-data/leads.json", "/%73erver-data/leads.json", "/api/_lib.php", "/api/router.php"]) {
      expect((await fetch(`${base}${path}`)).status).toBe(404);
    }
  });
  test("cross-origin submission is rejected before writes", async () => {
    expect((await request("/api/lead.php", {}, { Origin: "https://example.org" })).status).toBe(403);
  });
  test("malformed fields and absent consent are rejected", async () => {
    for (const patch of [{ name: "" }, { phone: "123" }, { consent: false }, { source: "unknown" }, { email: "invalid" }]) {
      const result = await request("/api/lead.php", { name: "Local fixture", phone: "+79119417205", source: "calculator", consent: true, ...patch });
      expect(result.status).toBe(400);
      expect(result.body.error).toBe("validation");
    }
  });
  test("anonymous admin requests cannot read data", async () => {
    for (const action of ["session", "leads", "settings", "mail-log", "spam-log", "data"]) {
      expect((await request(`/api/admin.php?action=${action}`)).status).toBe(401);
    }
  });
  test("fake local admin login, cookie and settings work", async () => {
    const login = await request("/api/admin.php?action=login", { password: "local-test-password" });
    expect(login.status).toBe(200);
    const setCookie = login.response.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie.toLowerCase()).toContain("secure");
    expect(setCookie).toContain("SameSite=Strict");
    cookie = setCookie.split(";")[0];
    expect((await request("/api/admin.php?action=session", undefined, { Cookie: cookie })).status).toBe(200);
    const result = await request("/api/admin.php?action=settings", undefined, { Cookie: cookie });
    expect(result.status).toBe(200);
    expect(result.body.smtpPass).toBeUndefined();
    expect(result.body.passwordHash).toBeUndefined();
  });
  test("accepted lead is stored once, normalized, and retries deduplicate", async () => {
    const body = { name: "Local fixture", phone: "8 (911) 941-72-05", source: "calculator", consent: true, clientId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", elapsedMs: 2000 };
    const first = await request("/api/lead.php", body);
    expect(first.status).toBe(200);
    expect(first.body.ok).toBe(true);
    const second = await request("/api/lead.php", body);
    expect(second.body.dedupe).toBe(true);
    expect(second.body.id).toBe(first.body.id);
    const stored = JSON.parse(readFileSync(join(root, "server-data/leads.json"), "utf8"));
    expect(stored).toHaveLength(1);
    expect(stored[0].phone).toBe("+79119417205");
  });
  test("same-origin beacon without XRW deduplicates", async () => {
    const result = await request("/api/lead.php", { clientId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" }, { "X-Requested-With": "" });
    expect(result.body.dedupe).toBe(true);
  });
  test("logout invalidates the session server-side", async () => {
    expect((await request("/api/admin.php?action=logout", {}, { Cookie: cookie })).status).toBe(200);
    expect((await request("/api/admin.php?action=session", undefined, { Cookie: cookie })).status).toBe(401);
  });
});

describe("PHP and TypeScript share menu and phone contracts", () => {
  function phpValid(draft: unknown): boolean {
    const output = php(`define('NILOV_ADMIN_TESTS', true); require '${join(root, "api/admin.php")}'; echo json_encode(validate_menu(json_decode(stream_get_contents(STDIN), true)));`, JSON.stringify(draft));
    return JSON.parse(output).length === 0;
  }
  test("actual menu passes both validators", () => {
    expect(phpValid(menu)).toBe(true);
    expect(validateMenuData(menu).ok).toBe(true);
  });
  for (const field of ["version", "addons", "minOrder", "servicePanels"]) {
    test(`missing ${field} rejected by both validators`, () => {
      const draft = structuredClone(menu) as Record<string, unknown>;
      delete draft[field];
      expect(phpValid(draft)).toBe(false);
      expect(validateMenuData(draft).ok).toBe(false);
    });
  }
  for (const field of ["label", "short", "description", "perGuest", "minGuests", "included", "packages"]) {
    test(`missing type ${field} rejected by both validators`, () => {
      const draft = structuredClone(menu);
      delete (draft.menuTypes[0] as Record<string, unknown>)[field];
      expect(phpValid(draft)).toBe(false);
      expect(validateMenuData(draft).ok).toBe(false);
    });
  }
  for (const field of ["description", "dishes"]) {
    test(`missing package ${field} rejected by both validators`, () => {
      const draft = structuredClone(menu);
      delete (draft.menuTypes[0].packages[0] as Record<string, unknown>)[field];
      expect(phpValid(draft)).toBe(false);
      expect(validateMenuData(draft).ok).toBe(false);
    });
  }
  test("IDs and minimums cannot diverge between validators", () => {
    const drafts = Array.from({ length: 4 }, () => structuredClone(menu));
    drafts[0].addons.push(structuredClone(menu.addons[0]));
    drafts[1].servicePanels.push(structuredClone(menu.servicePanels[0]));
    delete (drafts[2].minOrder as Record<string, number>).buffet;
    drafts[3].minOrder.buffet = 0;
    for (const draft of drafts) {
      expect(phpValid(draft)).toBe(false);
      expect(validateMenuData(draft).ok).toBe(false);
    }
  });
  test("format IDs cannot become traversal paths in generated PDF filenames", () => {
    const draft = structuredClone(menu);
    draft.menuTypes[0].id = "../../outside";
    const orders = draft.minOrder as Record<string, number>;
    orders["../../outside"] = orders.buffet;
    delete orders.buffet;
    expect(phpValid(draft)).toBe(false);
    expect(validateMenuData(draft).ok).toBe(false);
  });
  test("phone formats are identical in PHP and TS", () => {
    for (const input of ["8 (911) 941-72-05", "+1 (303) 555-0199", "+44.20.7946.0958", "123abc4567890"]) {
      const output = php(`define('NILOV_API', true); require '${join(root, "api/_lib.php")}'; echo normalize_phone(stream_get_contents(STDIN));`, input);
      expect(output).toBe(normalizePhone(input));
    }
  });
});

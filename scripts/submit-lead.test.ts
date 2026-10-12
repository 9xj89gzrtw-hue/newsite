import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizePhone } from "../src/lib/phone";

// Evaluate only this local module, with an isolated browser/storage/fetch
// fixture. No test can send a real request or persist personal data.
const source = readFileSync(resolve(import.meta.dir, "../src/lib/submit-lead.ts"), "utf8")
  .replace('import { normalizePhone } from "@/lib/phone";', "");
const compiled = new Bun.Transpiler({ loader: "ts", target: "browser" })
  .transformSync(source).replace(/\bexport /g, "");
const load = new Function("window", "fetch", "normalizePhone", "navigator", "crypto",
  `${compiled}\nreturn { submitLead, resendPendingLeads };`);
const args = { name: "Local fixture", phone: "8 (911) 941-72-05", source: "calculator", consent: true, elapsedMs: 2000 };
const key = "catering-lead-outbox";

function fixture(fetcher: (url: string, init: RequestInit) => Promise<Response>, blocked = false) {
  const storage = new Map<string, string>();
  const events = new EventTarget();
  const timers: (() => void)[] = [];
  const beacons: Blob[] = [];
  const win = {
    location: { pathname: "/" },
    addEventListener: events.addEventListener.bind(events),
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
    get localStorage() {
      if (blocked) throw new DOMException("Storage denied", "SecurityError");
      return { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v) };
    },
  };
  const api = load(win, fetcher, normalizePhone, { sendBeacon: (_url: string, body: Blob) => { beacons.push(body); return true; } }, crypto);
  return { ...api, storage, events, timers, beacons };
}

describe("lead submission resilience", () => {
  test("blocked storage cannot stop the network submission", async () => {
    let calls = 0;
    const f = fixture(async (_url, init) => {
      calls++;
      const body = JSON.parse(String(init.body));
      expect(body.phone).toBe("+79119417205");
      expect(init.signal).toBeInstanceOf(AbortSignal);
      return Response.json({ ok: true, id: "local-id" });
    }, true);
    expect(await f.submitLead(args)).toEqual({ ok: true, id: "local-id" });
    expect(calls).toBe(1);
  });
  test("success removes the queued request", async () => {
    const f = fixture(async () => Response.json({ ok: true, id: "local-id" }));
    await f.submitLead(args);
    expect(JSON.parse(f.storage.get(key)!)).toEqual([]);
  });
  test("network failure retains the same request for retry", async () => {
    const f = fixture(async () => { throw new Error("offline"); });
    expect(await f.submitLead(args)).toEqual({ ok: false, reason: "network", queued: true });
    const entries = JSON.parse(f.storage.get(key)!);
    expect(entries).toHaveLength(1);
    expect(entries[0].tries).toBe(1);
  });
  test("validation failure is not retried", async () => {
    const f = fixture(async () => Response.json({ ok: false, error: "validation" }, { status: 400 }));
    expect(await f.submitLead(args)).toEqual({ ok: false, reason: "validation", queued: false });
    expect(JSON.parse(f.storage.get(key)!)).toEqual([]);
  });
  test("rate-limit delay is exposed to the form", async () => {
    const f = fixture(async () => Response.json({ retryAfterSec: 120 }, { status: 429 }));
    expect(await f.submitLead(args)).toEqual({ ok: false, reason: "server", retryAfterSec: 120, queued: true });
  });
  test("blocked storage plus failed network must not claim that a lead was saved", async () => {
    const f = fixture(async () => { throw new Error("offline"); }, true);
    expect(await f.submitLead(args)).toEqual({ ok: false, reason: "network", queued: false });
  });
  test("invalid cached entries cannot crash the resend loop", async () => {
    let calls = 0;
    const f = fixture(async () => { calls++; return Response.json({ ok: true, id: "local-id" }); });
    f.storage.set(key, JSON.stringify([
      { clientId: "bad", ts: Date.now() - 60000, tries: 0, payload: { phone: null } },
      { clientId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", ts: Date.now() - 60000, tries: 0, payload: args },
    ]));
    f.resendPendingLeads();
    f.timers[0]();
    await Bun.sleep(20);
    expect(calls).toBe(1);
    expect(JSON.parse(f.storage.get(key)!)).toEqual([]);
  });
  test("closing the page preserves each concurrent in-flight request even with blocked storage", async () => {
    const pending: ((r: Response) => void)[] = [];
    const f = fixture(() => new Promise<Response>((resolve) => pending.push(resolve)), true);
    f.resendPendingLeads();
    const first = f.submitLead(args);
    const second = f.submitLead({ ...args, name: "Second fixture" });
    pending[0](Response.json({ ok: true, id: "first" }));
    await first;
    f.events.dispatchEvent(new Event("pagehide"));
    expect(f.beacons).toHaveLength(1);
    expect(JSON.parse(await f.beacons[0].text()).name).toBe("Second fixture");
    pending[1](Response.json({ ok: true, id: "second" }));
    await second;
  });
});

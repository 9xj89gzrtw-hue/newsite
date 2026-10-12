import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import menu from "../src/data/menu.json";

const out = resolve(import.meta.dir, "../out");
for (const file of ["index.html", "about.html", "offer.html", "privacy.html", "terms.html", "admin.html", "404.html", ".htaccess", "api/lead.php", "api/admin.php", "api/router.php"]) {
  assert.ok(existsSync(resolve(out, file)), `Static export is missing ${file}`);
}
assert.deepEqual(
  JSON.parse(readFileSync(resolve(out, "data/menu.json"), "utf8")),
  menu,
  "Exported menu must match the single source of truth",
);
const manifest = JSON.parse(readFileSync(resolve(out, "menu-pdf/manifest.json"), "utf8")) as {
  entries: { typeId: string; pkgIdx: number; file: string }[];
};
assert.equal(manifest.entries.length, 1 + menu.menuTypes.reduce((n, t) => n + t.packages.length, 0));
for (const type of menu.menuTypes) {
  for (let i = 0; i < type.packages.length; i++) {
    assert.ok(manifest.entries.some((e) => e.typeId === type.id && e.pkgIdx === i), `Missing PDF manifest entry ${type.id} / ${i}`);
  }
}
for (const entry of manifest.entries) {
  const bytes = readFileSync(resolve(out, "menu-pdf", entry.file));
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-", `Invalid PDF: ${entry.file}`);
  assert.ok(bytes.length > 1000, `Empty PDF: ${entry.file}`);
}
assert.ok(!existsSync(resolve(out, "config/secrets.php")), "Private credentials must never be included in the build");
console.log(`✓ Static export verified: routes, PHP endpoints, source menu, ${manifest.entries.length} PDF attachments and no private credentials`);

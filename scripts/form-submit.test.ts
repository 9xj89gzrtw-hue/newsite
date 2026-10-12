import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("calculator submit releases its lock in finally, including early error returns", () => {
  const source = readFileSync(resolve(import.meta.dir, "../src/components/catering/hacc-booking.tsx"), "utf8");
  const handlerEnd = source.indexOf('const menuType = MENU_TYPES.find', source.indexOf('if (submitInFlightRef.current) return;'));
  const handler = source.slice(source.indexOf('if (submitInFlightRef.current) return;'), handlerEnd);
  expect(handler).toMatch(/}\s*finally\s*{[\s\S]*?setStatus\("idle"\);\s*submitInFlightRef\.current = false;\s*}/);
});

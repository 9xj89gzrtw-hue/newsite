import { describe, expect, test } from "bun:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const braces = require("braces") as {
  (pattern: string): string[];
  parse: (pattern: string) => unknown;
  compile: (input: unknown) => string;
  stringify: (input: unknown) => string;
  expand: (input: unknown) => string[];
};

describe("braces local mitigation (GHSA-vfj7-8cjw-p6xm)", () => {
  test("normal patterns retain their output", () => {
    expect(braces.expand("src/{app,lib}/file.{ts,tsx}")).toEqual([
      "src/app/file.ts", "src/app/file.tsx", "src/lib/file.ts", "src/lib/file.tsx",
    ]);
  });
  test("deep string input throws a controlled SyntaxError, not a stack overflow", () => {
    const input = "{".repeat(5000) + "a,b" + "}".repeat(5000);
    for (const fn of [braces.parse, braces.compile, braces.expand, braces.stringify]) {
      expect(() => fn(input)).toThrow(SyntaxError);
    }
  });
  test("externally supplied AST cannot bypass depth protection", () => {
    let ast: unknown = { type: "text", value: "x" };
    for (let i = 0; i < 5000; i++) ast = { type: "root", nodes: [ast] };
    for (const fn of [braces.compile, braces.expand, braces.stringify]) {
      expect(() => fn(ast)).toThrow(SyntaxError);
    }
  });
  test("normal nested AST remains supported", () => {
    const input = "{".repeat(10) + "a" + "}".repeat(10);
    expect(braces.stringify(braces.parse(input))).toBe(input);
  });
});

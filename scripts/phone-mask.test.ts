import { expect, test } from "bun:test";
import { maskPhoneInput } from "../src/lib/phone-mask";

test("phone mask formats local, country-code, trunk and pasted numbers", () => {
  for (const raw of ["9119417205", "79119417205", "89119417205", "+7 (911) 941-72-05"]) {
    expect(maskPhoneInput(raw)).toBe("+7 (911) 941-72-05");
  }
});
test("partial input is readable and can be cleared", () => {
  expect(maskPhoneInput("")).toBe("");
  expect(maskPhoneInput("7")).toBe("+7");
  expect(maskPhoneInput("9")).toBe("+7 (9");
  expect(maskPhoneInput("7911")).toBe("+7 (911)");
  expect(maskPhoneInput("7911941")).toBe("+7 (911) 941");
});
test("invalid or overlong numbers are not silently truncated into valid ones", () => {
  expect(maskPhoneInput("791194172051")).toBe("791194172051");
  expect(maskPhoneInput("+1 303 123 4567")).toBe("+1 303 123 4567");
});

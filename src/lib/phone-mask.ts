/** Russian phone mask without hiding excess digits from validation. */
export function maskPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length > 11) return raw;
  if (digits[0] === "7" || digits[0] === "8") digits = digits.slice(1);
  else if (digits[0] !== "9") return raw;
  if (digits.length > 10) return raw;
  let text = "+7";
  if (digits.length) text += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) text += ")";
  if (digits.length > 3) text += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) text += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) text += `-${digits.slice(8, 10)}`;
  return text;
}

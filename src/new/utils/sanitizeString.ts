import stripAnsi from "strip-ansi";

export default function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }
  const sanitized = stripAnsi(input).replace(
    /[^\t\n\r\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
    "",
  );
  return sanitized;
}

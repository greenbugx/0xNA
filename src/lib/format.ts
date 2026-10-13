const ORDINAL_SUFFIXES = ["th", "st", "nd", "rd"];

export function formatOrdinal(value: number): string {
  if (!Number.isFinite(value)) return "";

  const whole = Math.trunc(value);
  const absolute = Math.abs(whole);
  const lastTwo = absolute % 100;

  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? "th"
      : ORDINAL_SUFFIXES[absolute % 10] ?? "th";

  return `${whole.toLocaleString("en-US")}${suffix}`;
}
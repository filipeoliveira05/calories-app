export function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

const DATE_PARAM_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function dateOnlyFromParam(param: string | undefined): Date {
  const match = param ? DATE_PARAM_RE.exec(param) : null;
  if (!match) return todayDateOnly();

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  const isValid =
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day;

  return isValid ? candidate : todayDateOnly();
}

export function dateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function isSameDate(a: Date, b: Date): boolean {
  return dateParam(a) === dateParam(b);
}

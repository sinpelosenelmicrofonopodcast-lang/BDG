function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

type TimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getTimePartsInZone(date: Date, timeZone: string): TimeParts {
  const formatter = getFormatter(timeZone);
  const parts = formatter.formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second")
  };
}

export function formatDateKeyInZone(date: Date, timeZone: string) {
  const parts = getTimePartsInZone(date, timeZone);

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function zonedDateTimeToUtc(dateValue: string, timeValue: string, timeZone: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const zonedParts = getTimePartsInZone(guess, timeZone);
  const asUtc = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second
  );
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const diff = desiredUtc - asUtc;

  return new Date(guess.getTime() - diff);
}

export function formatDateTimeForDisplay(value: string | Date, timeZone: string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function timeValueInZone(date: Date, timeZone: string) {
  const parts = getTimePartsInZone(date, timeZone);

  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

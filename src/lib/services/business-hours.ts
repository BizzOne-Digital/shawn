import { DayOfWeek } from "@prisma/client";

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export interface BusinessHourInput {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  is24Hours: boolean;
}

export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[new Date().getDay()];
}

export function isOpenNow(hours: BusinessHourInput[]): boolean {
  const today = getCurrentDayOfWeek();
  const todayHours = hours.find((h) => h.dayOfWeek === today);

  if (!todayHours || todayHours.isClosed) return false;
  if (todayHours.is24Hours) return true;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return !!(
    todayHours.openTime &&
    todayHours.closeTime &&
    currentTime >= todayHours.openTime &&
    currentTime <= todayHours.closeTime
  );
}

export function formatHours(hours: BusinessHourInput[]): { day: string; hours: string }[] {
  return DAY_ORDER.map((day) => {
    const h = hours.find((hour) => hour.dayOfWeek === day);
    if (!h || h.isClosed) return { day: DAY_LABELS[day], hours: "Closed" };
    if (h.is24Hours) return { day: DAY_LABELS[day], hours: "Open 24 hours" };
    return {
      day: DAY_LABELS[day],
      hours: `${formatTime(h.openTime!)} – ${formatTime(h.closeTime!)}`,
    };
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function getOpenStatusLabel(hours: BusinessHourInput[]): string {
  return isOpenNow(hours) ? "Open now" : "Closed";
}

export const DEFAULT_HOURS: BusinessHourInput[] = DAY_ORDER.map((day) => ({
  dayOfWeek: day,
  openTime: day === "SUNDAY" ? null : "09:00",
  closeTime: day === "SUNDAY" ? null : "17:00",
  isClosed: day === "SUNDAY",
  is24Hours: false,
}));

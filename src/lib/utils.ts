export const inputClass =
  "w-full rounded-lg border-2 border-black/[.12] bg-white px-3.5 py-2.5 text-sm text-black shadow-sm placeholder:text-zinc-400 transition-colors focus:border-sunset-2 focus:outline-none focus:ring-4 focus:ring-sunset-2/15 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-sunset-2 dark:focus:ring-sunset-2/20";

export const labelClass =
  "mb-1 block text-sm font-medium text-black dark:text-zinc-50";

export const primaryButtonClass =
  "flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]";

export const secondaryButtonClass =
  "flex items-center justify-center rounded-full border border-black/[.15] px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.2] dark:text-zinc-50 dark:hover:bg-white/[.06]";

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDayHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

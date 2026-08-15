export type TripStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export function getTripStatus(
  startDate: Date,
  endDate: Date,
  now: Date = new Date(),
): TripStatus {
  if (now < startDate) return "UPCOMING";
  if (now > endDate) return "COMPLETED";
  return "ONGOING";
}

export const tripStatusLabels: Record<TripStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

export const tripStatusBadgeClass: Record<TripStatus, string> = {
  UPCOMING: "bg-sunset-2/15 text-sunset-2 dark:bg-sunset-2/20",
  ONGOING: "bg-ocean-1/20 text-ocean-1 dark:bg-ocean-1/25 dark:text-white",
  COMPLETED: "bg-black/[.06] text-zinc-500 dark:bg-white/[.08] dark:text-zinc-400",
};

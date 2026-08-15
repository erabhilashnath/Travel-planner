import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/config";
import { prisma } from "@/server/db";
import { detectCountry } from "@/features/calendar/countries";
import { getPublicHolidays } from "@/features/calendar/holidays";
import { formatDate } from "@/lib/utils";
import { PageHeader, PageMain, PageTitle } from "@/components/page-shell";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const NO_TRIP_MESSAGES = [
  "No trips this month. Your passport is getting bored. 🛂",
  "This month is refreshingly plan-free. Your wallet says thank you.",
  "No adventures scheduled — time to open a maps app and dream a little. 🗺️",
  "Nothing booked yet. The best trips start with a wild idea and a cheap flight search.",
  "Calendar's empty. Somewhere, a beach is waiting for you. 🏖️",
  "No trips this month. Life's too short to stay in one time zone.",
  "Empty month ahead — perfect time to add somewhere new to the list.",
  "No plans yet, but every great trip starts exactly like this: nothing on the calendar.",
];

function toUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const now = new Date();
  const { year: yearParam, month: monthParam } = await searchParams;
  const year = Number(yearParam) || now.getUTCFullYear();
  const month = monthParam ? Number(monthParam) - 1 : now.getUTCMonth(); // 0-indexed

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id, status: "ACCEPTED" } } },
    select: { id: true, name: true, destination: true, startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  });

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay();
  const monthStartKey = Date.UTC(year, month, 1);
  const monthEndKey = Date.UTC(year, month, daysInMonth);

  const tripByDay = new Map<number, { id: string; name: string }>();
  for (const trip of trips) {
    const start = toUtcDay(trip.startDate);
    const end = toUtcDay(trip.endDate);
    for (let t = start; t <= end; t += 86400000) {
      const d = new Date(t);
      if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
        tripByDay.set(d.getUTCDate(), { id: trip.id, name: trip.name });
      }
    }
  }

  const todayKey = toUtcDay(now);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Trips whose date range overlaps the currently displayed month.
  const tripsThisMonth = trips.filter(
    (t) => toUtcDay(t.startDate) <= monthEndKey && toUtcDay(t.endDate) >= monthStartKey,
  );

  const tripPanelData = await Promise.all(
    tripsThisMonth.map(async (trip) => {
      const country = detectCountry(trip.destination);
      if (!country) return { trip, holidays: [] as { date: string; localName: string; name: string }[] };

      const holidays = await getPublicHolidays(country.code, year);
      const tripStart = toUtcDay(trip.startDate);
      const tripEnd = toUtcDay(trip.endDate);
      const relevant = holidays.filter((h) => {
        const hKey = toUtcDay(new Date(`${h.date}T00:00:00Z`));
        return hKey >= tripStart && hKey <= tripEnd && hKey >= monthStartKey && hKey <= monthEndKey;
      });
      return { trip, holidays: relevant };
    }),
  );

  const noTripMessage = NO_TRIP_MESSAGES[(year * 12 + month) % NO_TRIP_MESSAGES.length];

  return (
    <>
      <PageHeader
        left={
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?year=${prevYear}&month=${prevMonth + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10"
              aria-label="Previous month"
            >
              ‹
            </Link>
            <span className="min-w-36 text-center text-sm font-medium text-zinc-50">
              {MONTH_NAMES[month]} {year}
            </span>
            <Link
              href={`/calendar?year=${nextYear}&month=${nextMonth + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10"
              aria-label="Next month"
            >
              ›
            </Link>
          </div>
        }
      />

      <PageMain className="max-w-5xl">
        <div className="mb-6">
          <PageTitle>Calendar</PageTitle>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950 lg:flex-1">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500 dark:text-zinc-500">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} />;

                const trip = tripByDay.get(day);
                const isToday = Date.UTC(year, month, day) === todayKey;

                const cellClass = trip
                  ? "bg-ocean-1/20 text-ocean-2 font-medium hover:bg-ocean-1/30 dark:bg-ocean-1/25 dark:text-white"
                  : "text-zinc-700 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]";

                const content = (
                  <div
                    className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${cellClass} ${
                      isToday ? "ring-2 ring-sunset-2" : ""
                    }`}
                    title={trip?.name}
                  >
                    {day}
                  </div>
                );

                return (
                  <div key={i}>
                    {trip ? <Link href={`/trips/${trip.id}`}>{content}</Link> : content}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
              <span className="h-3 w-3 rounded bg-ocean-1/30" />
              Trip planned
            </div>
          </div>

          <aside className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-80 lg:shrink-0">
            <h2 className="mb-3 text-sm font-semibold text-zinc-50">
              Trips in {MONTH_NAMES[month]}
            </h2>

            {tripPanelData.length === 0 ? (
              <p className="text-sm text-zinc-300">{noTripMessage}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tripPanelData.map(({ trip, holidays }) => (
                  <li
                    key={trip.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <Link
                      href={`/trips/${trip.id}`}
                      className="font-medium text-zinc-50 hover:underline"
                    >
                      {trip.destination}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-300">{trip.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                    {holidays.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2">
                        {holidays.map((h) => (
                          <p key={h.date} className="text-xs text-sunset-1">
                            🎉 {h.localName || h.name} —{" "}
                            {formatDate(new Date(`${h.date}T00:00:00Z`))}
                          </p>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </PageMain>
    </>
  );
}

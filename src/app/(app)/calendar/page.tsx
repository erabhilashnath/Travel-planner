import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader, PageMain, PageTitle } from "@/components/page-shell";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    select: { id: true, name: true, startDate: true, endDate: true },
  });

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay();

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

  return (
    <>
      <PageHeader
        left={
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?year=${prevYear}&month=${prevMonth + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
              aria-label="Previous month"
            >
              ‹
            </Link>
            <span className="min-w-36 text-center text-sm font-medium text-black dark:text-zinc-50">
              {MONTH_NAMES[month]} {year}
            </span>
            <Link
              href={`/calendar?year=${nextYear}&month=${nextMonth + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
              aria-label="Next month"
            >
              ›
            </Link>
          </div>
        }
      />

      <PageMain className="max-w-3xl">
        <div className="mb-6">
          <PageTitle>Calendar</PageTitle>
        </div>

        <div className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
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
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
          <span className="h-3 w-3 rounded bg-ocean-1/30" />
          Trip planned
        </div>
      </PageMain>
    </>
  );
}

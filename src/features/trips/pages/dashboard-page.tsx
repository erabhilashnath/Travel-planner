import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/config";
import { prisma } from "@/server/db";
import { PageMain } from "@/components/page-shell";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id, status: "ACCEPTED" } } },
    orderBy: { startDate: "asc" },
  });

  return (
    <PageMain className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-medium text-zinc-50">
          Your trips
        </h2>
        <Link
          href="/trips/new"
          className="rounded-full bg-gradient-to-r from-sunset-2 to-sunset-3 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          + New trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-black/[.15] bg-white/60 px-6 py-16 text-center dark:border-white/[.2] dark:bg-zinc-950/40">
          <span className="text-4xl">🧭</span>
          <p className="font-display text-lg font-medium text-black dark:text-zinc-50">
            No trips yet
          </p>
          <p className="max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            Create your first trip to start building an itinerary and
            tracking expenses.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="group block overflow-hidden rounded-xl border border-black/[.08] bg-white transition-colors hover:border-black/[.15] dark:border-white/[.145] dark:bg-zinc-950 dark:hover:border-white/[.25]"
              >
                <div className="h-2 bg-gradient-to-r from-sunset-1 via-sunset-2 to-sunset-3" />
                <div className="p-4">
                  <p className="font-display text-lg font-medium text-black dark:text-zinc-50">
                    {trip.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {trip.destination}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageMain>
  );
}

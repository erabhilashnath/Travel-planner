import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/config";
import { prisma } from "@/server/db";
import { PageHeader, PageMain, PageTitle } from "@/components/page-shell";
import { formatDate } from "@/lib/utils";
import { getTripStatus, tripStatusLabels, tripStatusBadgeClass } from "@/features/trips/status";

export default async function TripHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const trips = await prisma.trip.findMany({
    where: { members: { some: { userId: session.user.id, status: "ACCEPTED" } } },
    orderBy: { startDate: "asc" },
  });

  const now = new Date();

  return (
    <>
      <PageHeader left={<span className="text-sm font-medium text-zinc-50">All trips</span>} />

      <PageMain className="max-w-2xl">
        <div className="mb-6">
          <PageTitle>Trip History</PageTitle>
        </div>

        {trips.length === 0 ? (
          <p className="text-sm text-zinc-300">
            No trips yet.{" "}
            <Link href="/trips/new" className="underline hover:text-white">
              Create your first trip
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {trips.map((trip) => {
              const status = getTripStatus(trip.startDate, trip.endDate, now);
              return (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] bg-white p-4 transition-colors hover:border-black/[.15] dark:border-white/[.145] dark:bg-zinc-950 dark:hover:border-white/[.25]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-black dark:text-zinc-50">
                        {trip.name}
                      </p>
                      <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {trip.destination}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${tripStatusBadgeClass[status]}`}
                    >
                      {tripStatusLabels[status]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PageMain>
    </>
  );
}

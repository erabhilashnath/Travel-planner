import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { deleteTrip } from "@/server/actions/trips";
import { formatDate, secondaryButtonClass, primaryButtonClass } from "@/lib/utils";
import { PageShell, PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";

export default async function TripOverviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership) {
    notFound();
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { _count: { select: { itineraryItems: true } } },
  });

  if (!trip) {
    notFound();
  }

  const editable = canEdit(membership.role);

  return (
    <PageShell>
      <PageHeader left={<BackLink href="/">Back to trips</BackLink>} />

      <PageMain>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <PageTitle className="break-words">{trip.name}</PageTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {trip.destination}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </p>
          </div>
          {editable && (
            <div className="flex shrink-0 gap-2">
              <Link href={`/trips/${trip.id}/edit`} className={secondaryButtonClass}>
                Edit
              </Link>
            </div>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Budget</p>
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              {trip.budgetAmount
                ? `${trip.budgetAmount.toString()} ${trip.homeCurrency}`
                : "Not set"}
            </p>
          </div>
          <div className="rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Itinerary items</p>
            <p className="text-lg font-medium text-black dark:text-zinc-50">
              {trip._count.itineraryItems}
            </p>
          </div>
        </div>

        <Link href={`/trips/${trip.id}/itinerary`} className={primaryButtonClass}>
          View itinerary
        </Link>

        {membership.role === "OWNER" && (
          <div className="mt-12 border-t border-black/[.08] pt-6 dark:border-white/[.145]">
            <h2 className="mb-2 text-sm font-medium text-black dark:text-zinc-50">
              Danger zone
            </h2>
            <form
              action={async () => {
                "use server";
                await deleteTrip(trip.id);
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete trip
              </button>
            </form>
          </div>
        )}
      </PageMain>
    </PageShell>
  );
}

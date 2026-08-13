import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { createItineraryItem, deleteItineraryItem } from "@/server/actions/itinerary";
import { itineraryCategories } from "@/lib/validation/itinerary";
import {
  formatDayHeading,
  formatTime,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/lib/utils";
import type { ItineraryItemModel } from "@/generated/prisma/models";
import { PageShell, PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";

const categoryLabels: Record<(typeof itineraryCategories)[number], string> = {
  FLIGHT: "Flight",
  LODGING: "Lodging",
  ACTIVITY: "Activity",
  TRANSPORT: "Transport",
  FOOD: "Food",
  OTHER: "Other",
};

function groupByDay(items: ItineraryItemModel[]) {
  const groups = new Map<string, ItineraryItemModel[]>();
  for (const item of items) {
    const key = item.date.toISOString().slice(0, 10);
    const existing = groups.get(key);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default async function ItineraryPage({
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

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    notFound();
  }

  const items = await prisma.itineraryItem.findMany({
    where: { tripId },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { sortOrder: "asc" }],
  });

  const editable = canEdit(membership.role);
  const dayGroups = groupByDay(items);
  const createItemForTrip = createItineraryItem.bind(null, tripId);

  return (
    <PageShell>
      <PageHeader left={<BackLink href={`/trips/${tripId}`}>Back to {trip.name}</BackLink>} />

      <PageMain>
        <div className="mb-6">
          <PageTitle>Itinerary</PageTitle>
        </div>

        {dayGroups.length === 0 ? (
          <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
            No itinerary items yet. Add your first one below.
          </p>
        ) : (
          <div className="mb-10 flex flex-col gap-8">
            {dayGroups.map(([dayKey, dayItems]) => (
              <div key={dayKey}>
                <h2 className="mb-3 text-sm font-semibold text-black dark:text-zinc-50">
                  {formatDayHeading(dayItems[0].date)}
                </h2>
                <ul className="flex flex-col gap-2">
                  {dayItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-black/[.06] px-2 py-0.5 text-xs font-medium text-black dark:bg-white/[.08] dark:text-zinc-50">
                            {categoryLabels[item.category]}
                          </span>
                          {item.startTime && (
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              {formatTime(item.startTime)}
                              {item.endTime && ` – ${formatTime(item.endTime)}`}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-words font-medium text-black dark:text-zinc-50">
                          {item.title}
                        </p>
                        {item.location && (
                          <p className="break-words text-sm text-zinc-600 dark:text-zinc-400">
                            {item.location}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-400">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      {editable && (
                        <div className="flex shrink-0 gap-3">
                          <Link
                            href={`/trips/${tripId}/itinerary/${item.id}/edit`}
                            className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                          >
                            Edit
                          </Link>
                          <form
                            action={async () => {
                              "use server";
                              await deleteItineraryItem(tripId, item.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {editable && (
          <div className="border-t border-black/[.08] pt-6 dark:border-white/[.145]">
            <h2 className="mb-4 text-sm font-medium text-black dark:text-zinc-50">
              Add itinerary item
            </h2>
            <form action={createItemForTrip} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="date" className={labelClass}>
                    Date
                  </label>
                  <input id="date" name="date" type="date" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="startTime" className={labelClass}>
                    Start time
                  </label>
                  <input id="startTime" name="startTime" type="time" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="endTime" className={labelClass}>
                    End time
                  </label>
                  <input id="endTime" name="endTime" type="time" className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Flight to Tokyo"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Category
                  </label>
                  <select id="category" name="category" className={inputClass} defaultValue="OTHER">
                    {itineraryCategories.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className={labelClass}>
                    Location (optional)
                  </label>
                  <input id="location" name="location" type="text" className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className={labelClass}>
                  Notes (optional)
                </label>
                <textarea id="notes" name="notes" rows={2} className={inputClass} />
              </div>

              <div>
                <button type="submit" className={primaryButtonClass}>
                  Add item
                </button>
              </div>
            </form>
          </div>
        )}
      </PageMain>
    </PageShell>
  );
}

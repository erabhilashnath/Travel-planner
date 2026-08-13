import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { updateItineraryItem } from "@/server/actions/itinerary";
import { itineraryCategories } from "@/lib/validation/itinerary";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/utils";

const categoryLabels: Record<(typeof itineraryCategories)[number], string> = {
  FLIGHT: "Flight",
  LODGING: "Lodging",
  ACTIVITY: "Activity",
  TRANSPORT: "Transport",
  FOOD: "Food",
  OTHER: "Other",
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toTimeInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(11, 16);
}

export default async function EditItineraryItemPage({
  params,
}: {
  params: Promise<{ tripId: string; itemId: string }>;
}) {
  const { tripId, itemId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || !canEdit(membership.role)) {
    notFound();
  }

  const item = await prisma.itineraryItem.findUnique({
    where: { id: itemId, tripId },
  });
  if (!item) {
    notFound();
  }

  const updateItemWithIds = updateItineraryItem.bind(null, tripId, itemId);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <Link
          href={`/trips/${tripId}/itinerary`}
          className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to itinerary
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <h1 className="mb-6 text-lg font-semibold text-black dark:text-zinc-50">
          Edit itinerary item
        </h1>

        <form action={updateItemWithIds} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className={labelClass}>
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={toDateInputValue(item.date)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="startTime" className={labelClass}>
                Start time
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={toTimeInputValue(item.startTime)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="endTime" className={labelClass}>
                End time
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={toTimeInputValue(item.endTime)}
                className={inputClass}
              />
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
              defaultValue={item.title}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                name="category"
                className={inputClass}
                defaultValue={item.category}
              >
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
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={item.location ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={item.notes ?? ""}
              className={inputClass}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
            <Link href={`/trips/${tripId}/itinerary`} className={secondaryButtonClass}>
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { updateTrip } from "@/server/actions/trips";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/utils";
import { currencyCodes, currencyLabels } from "@/lib/currencies";
import { PageShell, PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditTripPage({
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
  if (!membership || !canEdit(membership.role)) {
    notFound();
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    notFound();
  }

  const updateTripWithId = updateTrip.bind(null, tripId);

  return (
    <PageShell>
      <PageHeader left={<BackLink href={`/trips/${tripId}`}>Back to trip</BackLink>} />

      <PageMain className="max-w-lg">
        <div className="mb-6">
          <PageTitle>Edit trip</PageTitle>
        </div>

        <form action={updateTripWithId} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Trip name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={trip.name}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="destination" className={labelClass}>
              Destination
            </label>
            <input
              id="destination"
              name="destination"
              type="text"
              required
              maxLength={100}
              defaultValue={trip.destination}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className={labelClass}>
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={toDateInputValue(trip.startDate)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelClass}>
                End date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                defaultValue={toDateInputValue(trip.endDate)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="homeCurrency" className={labelClass}>
                Home currency
              </label>
              <select
                id="homeCurrency"
                name="homeCurrency"
                required
                defaultValue={trip.homeCurrency}
                className={inputClass}
              >
                {currencyCodes.map((code) => (
                  <option key={code} value={code}>
                    {code} — {currencyLabels[code]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budgetAmount" className={labelClass}>
                Budget (optional)
              </label>
              <input
                id="budgetAmount"
                name="budgetAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={trip.budgetAmount?.toString() ?? ""}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
            <Link href={`/trips/${tripId}`} className={secondaryButtonClass}>
              Cancel
            </Link>
          </div>
        </form>
      </PageMain>
    </PageShell>
  );
}

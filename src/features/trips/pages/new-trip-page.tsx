import Link from "next/link";

import { createTrip } from "@/features/trips/actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/utils";
import { currencyCodes, currencyLabels } from "@/features/trips/currencies";
import { PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate, endDate } = await searchParams;

  return (
    <>
      <PageHeader left={<BackLink href="/">Back to trips</BackLink>} />

      <PageMain className="max-w-lg">
        <div className="mb-6">
          <PageTitle>New trip</PageTitle>
        </div>

        <form action={createTrip} className="flex flex-col gap-4">
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
              placeholder="Japan Trip"
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
              placeholder="Tokyo, Japan"
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
                defaultValue={startDate}
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
                defaultValue={endDate}
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
                defaultValue="USD"
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
                placeholder="3000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button type="submit" className={primaryButtonClass}>
              Create trip
            </button>
            <Link href="/" className={secondaryButtonClass}>
              Cancel
            </Link>
          </div>
        </form>
      </PageMain>
    </>
  );
}

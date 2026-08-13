import Link from "next/link";

import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { createTrip } from "@/server/actions/trips";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/utils";

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
        <Link href="/" className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50">
          ← Back to trips
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <h1 className="mb-6 text-lg font-semibold text-black dark:text-zinc-50">
          New trip
        </h1>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={labelClass}>
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
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
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="homeCurrency" className={labelClass}>
                Home currency
              </label>
              <input
                id="homeCurrency"
                name="homeCurrency"
                type="text"
                required
                maxLength={3}
                minLength={3}
                defaultValue="USD"
                placeholder="USD"
                className={`${inputClass} uppercase`}
              />
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
      </main>
    </div>
  );
}

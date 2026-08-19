"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { inputClass, primaryButtonClass } from "@/lib/utils";

const cardLabelClass = "mb-1 block text-sm font-medium text-black dark:text-zinc-50";

export function PlanTripCard() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canPlan = startDate !== "" && endDate !== "";

  function handlePlan() {
    if (!canPlan) return;
    const params = new URLSearchParams({ startDate, endDate });
    router.push(`/trips/new?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
      <span className="font-display text-base font-medium text-black dark:text-zinc-50">
        🗺️ Plan your trip
      </span>
      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
        Pick your travel dates to get started.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan-start-date" className={cardLabelClass}>
            Travel start date
          </label>
          <input
            id="plan-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="plan-end-date" className={cardLabelClass}>
            Travel end date
          </label>
          <input
            id="plan-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlan}
        disabled={!canPlan}
        className={`${primaryButtonClass} mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Plan your trip
      </button>
    </div>
  );
}

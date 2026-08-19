"use client";

import { useState } from "react";

import { inputClass, primaryButtonClass } from "@/lib/utils";
import { PlacesMapLoader } from "@/features/places/places-map-loader";
import type { NominatimPlace } from "@/server/nominatim";
import type { WikipediaSummary } from "@/features/destination-guide/wikipedia";
import type { NearbyPlace } from "@/features/destination-guide/overpass";
import type { MonthlyClimate } from "@/features/destination-guide/climate";

interface GuideResult {
  place: NominatimPlace;
  wikipedia: WikipediaSummary | null;
  emergencyServices: NearbyPlace[];
  activities: NearbyPlace[];
  climate: MonthlyClimate[] | null;
}

function ClimateChart({ climate }: { climate: MonthlyClimate[] }) {
  const maxTemp = Math.max(...climate.map((m) => m.avgTempC), 1);
  const maxPrecip = Math.max(...climate.map((m) => m.totalPrecipitationMm), 1);

  return (
    <div>
      <div className="flex items-end gap-1.5">
        {climate.map((m) => (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end gap-0.5">
              <div
                className="flex-1 rounded-t bg-sunset-2"
                style={{ height: `${Math.max((m.avgTempC / maxTemp) * 100, 3)}%` }}
                title={`${m.avgTempC}°C avg`}
              />
              <div
                className="flex-1 rounded-t bg-ocean-1"
                style={{ height: `${Math.max((m.totalPrecipitationMm / maxPrecip) * 100, 3)}%` }}
                title={`${m.totalPrecipitationMm}mm rain`}
              />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500">{m.month}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sunset-2" /> Avg. temp
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ocean-1" /> Rainfall
        </span>
      </div>
    </div>
  );
}

function NearbyList({ items, emptyText }: { items: NearbyPlace[]; emptyText: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-500">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 truncate text-black dark:text-zinc-50">{item.name}</span>
          <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
            {item.km.toFixed(1)} km
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DestinationGuideSection({
  defaultDestination,
  defaultOpen = false,
  subtitle,
}: {
  defaultDestination: string;
  defaultOpen?: boolean;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(defaultDestination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuideResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/destination-guide/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong — try again");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <span className="font-display text-base font-medium text-black dark:text-zinc-50">
            🧭 Know your destination
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </span>
          )}
        </div>
        <span className="shrink-0 text-zinc-400">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="border-t border-black/[.08] p-4 dark:border-white/[.145]">
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              className={`${inputClass} min-w-0`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`${primaryButtonClass} shrink-0 whitespace-nowrap disabled:opacity-40`}
            >
              {loading ? "Looking up…" : "Look up"}
            </button>
          </form>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {result && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                  Overview
                </h3>
                {result.wikipedia ? (
                  <div className="flex gap-3">
                    {result.wikipedia.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- small external thumbnail, not worth next/image config
                      <img
                        src={result.wikipedia.thumbnailUrl}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {result.wikipedia.extract}
                      </p>
                      <a
                        href={result.wikipedia.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-sunset-2 hover:underline"
                      >
                        Read more on Wikipedia →
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    No overview available for this place.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                  Location
                </h3>
                <PlacesMapLoader
                  places={[{ id: "destination", name: result.place.label, lat: result.place.lat, lng: result.place.lng }]}
                />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                  Best time to visit
                </h3>
                {result.climate ? (
                  <ClimateChart climate={result.climate} />
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Climate data unavailable for this place.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                  Things to do nearby
                </h3>
                <NearbyList items={result.activities} emptyText="No listed attractions nearby." />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
                  Emergency & health
                </h3>
                <NearbyList
                  items={result.emergencyServices}
                  emptyText="No listed hospitals/police/pharmacies nearby."
                />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  For informational purposes only — always check the local emergency number
                  before you travel.
                </p>
              </div>

              <div className="rounded-lg border border-dashed border-sunset-2/40 bg-sunset-2/5 p-3">
                <p className="text-sm font-medium text-black dark:text-zinc-50">
                  ✨ Get an AI-written destination summary
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  A richer, written overview — coming soon for upgraded accounts.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-2 cursor-not-allowed rounded-full bg-black/[.06] px-4 py-1.5 text-xs font-medium text-zinc-500 dark:bg-white/[.08] dark:text-zinc-400"
                >
                  Upgrade (coming soon)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

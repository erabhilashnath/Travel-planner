"use client";

import dynamic from "next/dynamic";

import type { MapPlace } from "@/features/places/places-map";

const PlacesMap = dynamic(
  () => import("@/features/places/places-map").then((mod) => mod.PlacesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-lg border border-black/[.08] text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-500">
        Loading map…
      </div>
    ),
  },
);

export function PlacesMapLoader({ places }: { places: MapPlace[] }) {
  return <PlacesMap places={places} />;
}

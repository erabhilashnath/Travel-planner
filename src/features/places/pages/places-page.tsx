import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/features/auth/config";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { createPlace, deletePlace } from "@/features/places/actions";
import { haversineKm } from "@/lib/distance";
import { PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";
import { PlaceAutocompleteForm } from "@/features/places/place-autocomplete-form";
import { PlacesMapLoader } from "@/features/places/places-map-loader";

export default async function PlacesPage({
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

  const places = await prisma.place.findMany({
    where: { tripId },
    orderBy: { sortOrder: "asc" },
  });

  const editable = canEdit(membership.role);
  const createPlaceForTrip = createPlace.bind(null, tripId);

  const legs = places.slice(1).map((place, i) => ({
    from: places[i],
    to: place,
    km: haversineKm(places[i], place),
  }));
  const totalKm = legs.reduce((sum, leg) => sum + leg.km, 0);

  return (
    <>
      <PageHeader left={<BackLink href={`/trips/${tripId}`}>Back to {trip.name}</BackLink>} />

      <PageMain>
        <div className="mb-6">
          <PageTitle>Places to visit</PageTitle>
        </div>

        <div className="mb-8">
          <PlacesMapLoader places={places} />
        </div>

        {places.length === 0 ? (
          <p className="mb-8 text-sm text-zinc-300">
            No places yet. Search for one below to add it.
          </p>
        ) : (
          <div className="mb-10">
            <ul className="flex flex-col gap-2">
              {places.map((place) => (
                <li
                  key={place.id}
                  className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-black dark:text-zinc-50">
                      {place.name}
                    </p>
                    {place.formattedAddress && (
                      <p className="break-words text-sm text-zinc-600 dark:text-zinc-400">
                        {place.formattedAddress}
                      </p>
                    )}
                    {place.notes && (
                      <p className="mt-1 break-words text-sm text-zinc-600 dark:text-zinc-400">
                        {place.notes}
                      </p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex shrink-0 gap-3">
                      <Link
                        href={`/trips/${tripId}/places/${place.id}/edit`}
                        className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deletePlace(tripId, place.id);
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

            {legs.length > 0 && (
              <div className="mt-6 rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950">
                <p className="mb-2 text-sm font-medium text-black dark:text-zinc-50">
                  Distance between stops (straight-line)
                </p>
                <ul className="flex flex-col gap-1">
                  {legs.map((leg, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                      {leg.from.name} → {leg.to.name}:{" "}
                      <span className="font-medium text-black dark:text-zinc-50">
                        {leg.km.toFixed(1)} km
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Total route: <span className="font-medium text-black dark:text-zinc-50">{totalKm.toFixed(1)} km</span>
                </p>
              </div>
            )}
          </div>
        )}

        {editable && (
          <div className="border-t border-black/[.08] pt-6 dark:border-white/[.145]">
            <h2 className="mb-4 text-sm font-medium text-zinc-50">
              Add a place
            </h2>
            <PlaceAutocompleteForm action={createPlaceForTrip} />
          </div>
        )}
      </PageMain>
    </>
  );
}

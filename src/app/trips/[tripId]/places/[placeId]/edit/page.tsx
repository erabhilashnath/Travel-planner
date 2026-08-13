import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { updatePlace } from "@/server/actions/places";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/utils";
import { PageShell, PageHeader, PageMain, PageTitle, BackLink } from "@/components/page-shell";

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ tripId: string; placeId: string }>;
}) {
  const { tripId, placeId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || !canEdit(membership.role)) {
    notFound();
  }

  const place = await prisma.place.findUnique({ where: { id: placeId, tripId } });
  if (!place) {
    notFound();
  }

  const updatePlaceWithIds = updatePlace.bind(null, tripId, placeId);

  return (
    <PageShell>
      <PageHeader left={<BackLink href={`/trips/${tripId}/places`}>Back to places</BackLink>} />

      <PageMain className="max-w-lg">
        <div className="mb-6">
          <PageTitle>Edit place</PageTitle>
        </div>

        <form action={updatePlaceWithIds} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={200}
              defaultValue={place.name}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="formattedAddress" className={labelClass}>
              Address (optional)
            </label>
            <input
              id="formattedAddress"
              name="formattedAddress"
              type="text"
              defaultValue={place.formattedAddress ?? ""}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lat" className={labelClass}>
                Latitude
              </label>
              <input
                id="lat"
                name="lat"
                type="number"
                step="any"
                required
                defaultValue={place.lat}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lng" className={labelClass}>
                Longitude
              </label>
              <input
                id="lng"
                name="lng"
                type="number"
                step="any"
                required
                defaultValue={place.lng}
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
              defaultValue={place.notes ?? ""}
              className={inputClass}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
            <Link href={`/trips/${tripId}/places`} className={secondaryButtonClass}>
              Cancel
            </Link>
          </div>
        </form>
      </PageMain>
    </PageShell>
  );
}

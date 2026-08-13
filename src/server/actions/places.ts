"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db";
import { requireEditableMembership } from "@/server/access";
import { placeFormSchema } from "@/lib/validation/place";

function parsePlaceForm(formData: FormData) {
  const result = placeFormSchema.safeParse({
    name: formData.get("name"),
    formattedAddress: formData.get("formattedAddress"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid place");
  }

  return result.data;
}

export async function createPlace(tripId: string, formData: FormData) {
  const userId = await requireEditableMembership(tripId);
  const data = parsePlaceForm(formData);

  const lastPlace = await prisma.place.findFirst({
    where: { tripId },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.place.create({
    data: {
      tripId,
      name: data.name,
      formattedAddress: data.formattedAddress,
      lat: data.lat,
      lng: data.lng,
      notes: data.notes,
      sortOrder: (lastPlace?.sortOrder ?? -1) + 1,
      createdById: userId,
    },
  });

  revalidatePath(`/trips/${tripId}/places`);
}

export async function updatePlace(tripId: string, placeId: string, formData: FormData) {
  await requireEditableMembership(tripId);
  const data = parsePlaceForm(formData);

  await prisma.place.update({
    where: { id: placeId, tripId },
    data: {
      name: data.name,
      formattedAddress: data.formattedAddress ?? null,
      lat: data.lat,
      lng: data.lng,
      notes: data.notes ?? null,
    },
  });

  revalidatePath(`/trips/${tripId}/places`);
  redirect(`/trips/${tripId}/places`);
}

export async function deletePlace(tripId: string, placeId: string) {
  await requireEditableMembership(tripId);

  await prisma.place.delete({ where: { id: placeId, tripId } });

  revalidatePath(`/trips/${tripId}/places`);
}

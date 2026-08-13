"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { itineraryItemFormSchema } from "@/lib/validation/itinerary";

function combineDateAndTime(date: Date, time: string | undefined) {
  if (!time) return undefined;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;
  const combined = new Date(date);
  combined.setUTCHours(hours, minutes, 0, 0);
  return combined;
}

async function requireEditableMembership(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || !canEdit(membership.role)) {
    throw new Error("You don't have permission to edit this trip's itinerary");
  }

  return session.user.id;
}

function parseItineraryForm(formData: FormData) {
  const result = itineraryItemFormSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    title: formData.get("title"),
    category: formData.get("category"),
    location: formData.get("location"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid itinerary item");
  }

  return result.data;
}

export async function createItineraryItem(tripId: string, formData: FormData) {
  const userId = await requireEditableMembership(tripId);
  const data = parseItineraryForm(formData);

  await prisma.itineraryItem.create({
    data: {
      tripId,
      date: data.date,
      startTime: combineDateAndTime(data.date, data.startTime),
      endTime: combineDateAndTime(data.date, data.endTime),
      title: data.title,
      category: data.category,
      location: data.location,
      notes: data.notes,
      createdById: userId,
    },
  });

  revalidatePath(`/trips/${tripId}/itinerary`);
}

export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  formData: FormData,
) {
  await requireEditableMembership(tripId);
  const data = parseItineraryForm(formData);

  await prisma.itineraryItem.update({
    where: { id: itemId, tripId },
    data: {
      date: data.date,
      startTime: combineDateAndTime(data.date, data.startTime) ?? null,
      endTime: combineDateAndTime(data.date, data.endTime) ?? null,
      title: data.title,
      category: data.category,
      location: data.location ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath(`/trips/${tripId}/itinerary`);
  redirect(`/trips/${tripId}/itinerary`);
}

export async function deleteItineraryItem(tripId: string, itemId: string) {
  await requireEditableMembership(tripId);

  await prisma.itineraryItem.delete({ where: { id: itemId, tripId } });

  revalidatePath(`/trips/${tripId}/itinerary`);
}

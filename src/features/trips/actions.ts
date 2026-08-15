"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/config";
import { prisma } from "@/server/db";
import { getTripMembership, canEdit } from "@/server/access";
import { tripFormSchema } from "@/features/trips/validation";

function parseTripForm(formData: FormData) {
  const result = tripFormSchema.safeParse({
    name: formData.get("name"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    homeCurrency: formData.get("homeCurrency"),
    budgetAmount: formData.get("budgetAmount"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid trip details");
  }

  return result.data;
}

export async function createTrip(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const data = parseTripForm(formData);

  const trip = await prisma.trip.create({
    data: {
      name: data.name,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      homeCurrency: data.homeCurrency,
      budgetAmount: data.budgetAmount,
      createdById: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
          status: "ACCEPTED",
          joinedAt: new Date(),
        },
      },
    },
  });

  revalidatePath("/");
  redirect(`/trips/${trip.id}`);
}

export async function updateTrip(tripId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || !canEdit(membership.role)) {
    throw new Error("You don't have permission to edit this trip");
  }

  const data = parseTripForm(formData);

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      name: data.name,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      homeCurrency: data.homeCurrency,
      budgetAmount: data.budgetAmount ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only the trip owner can delete this trip");
  }

  await prisma.trip.delete({ where: { id: tripId } });

  revalidatePath("/");
  redirect("/");
}

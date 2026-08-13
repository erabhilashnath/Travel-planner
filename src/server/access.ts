import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export async function getTripMembership(tripId: string, userId: string) {
  return prisma.tripMember.findFirst({
    where: { tripId, userId, status: "ACCEPTED" },
  });
}

export function canEdit(role: "OWNER" | "EDITOR" | "VIEWER") {
  return role === "OWNER" || role === "EDITOR";
}

export async function requireEditableMembership(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const membership = await getTripMembership(tripId, session.user.id);
  if (!membership || !canEdit(membership.role)) {
    throw new Error("You don't have permission to edit this trip");
  }

  return session.user.id;
}

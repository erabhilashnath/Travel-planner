import { prisma } from "@/server/db";

export async function getTripMembership(tripId: string, userId: string) {
  return prisma.tripMember.findFirst({
    where: { tripId, userId, status: "ACCEPTED" },
  });
}

export function canEdit(role: "OWNER" | "EDITOR" | "VIEWER") {
  return role === "OWNER" || role === "EDITOR";
}

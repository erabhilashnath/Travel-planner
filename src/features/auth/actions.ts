"use server";

import { signOut } from "@/features/auth/config";

export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}

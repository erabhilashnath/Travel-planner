import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { signOutAction } from "@/server/actions/auth";
import { AppChrome } from "@/components/app-chrome";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <AppChrome
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      onSignOut={signOutAction}
    >
      {children}
    </AppChrome>
  );
}

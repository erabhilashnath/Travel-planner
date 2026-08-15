import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/config";
import { signOutAction } from "@/features/auth/actions";
import { AppChrome } from "@/components/shell/app-chrome";

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

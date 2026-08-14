"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { TopBar } from "@/components/top-bar";
import { Sidebar } from "@/components/sidebar";

interface AppChromeProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export function AppChrome({ user, onSignOut, children }: AppChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cream dark:bg-black">
      <TopBar user={user} onSignOut={onSignOut} onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="animate-drift absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sunset-1/40 blur-3xl dark:bg-sunset-2/10" />
            <div
              className="animate-drift absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-sunset-3/25 blur-3xl dark:bg-sunset-3/10"
              style={{ animationDelay: "4s", animationDirection: "alternate-reverse" }}
            />
            <div
              className="animate-drift absolute bottom-[-15%] left-1/4 h-96 w-96 rounded-full bg-sunset-2/25 blur-3xl dark:bg-sunset-2/10"
              style={{ animationDelay: "8s" }}
            />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

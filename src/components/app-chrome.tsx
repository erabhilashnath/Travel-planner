"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { TopBar } from "@/components/top-bar";
import { Sidebar } from "@/components/sidebar";
import { AppBackground } from "@/components/app-background";

interface AppChromeProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export function AppChrome({ user, onSignOut, children }: AppChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar user={user} onSignOut={onSignOut} onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="relative flex-1 overflow-y-auto">
          <AppBackground />
          {children}
        </main>
      </div>
    </div>
  );
}

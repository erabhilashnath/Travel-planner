"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import {
  HomeIcon,
  HistoryIcon,
  CalendarIcon,
  ReportsIcon,
  BookingsIcon,
  CloseIcon,
} from "@/components/nav-icons";

interface NavItem {
  label: string;
  href: string | null;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Trip History", href: null, icon: HistoryIcon },
  { label: "Calendar", href: null, icon: CalendarIcon },
  { label: "Reports", href: null, icon: ReportsIcon },
  { label: "Active Bookings", href: null, icon: BookingsIcon },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 shrink-0 transform overflow-y-auto border-r border-black/[.08] bg-white transition-transform duration-200 dark:border-white/[.145] dark:bg-zinc-950 sm:static sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:hidden">
          <span className="text-sm font-semibold text-black dark:text-zinc-50">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href !== null && pathname === item.href;
            const content = (
              <>
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </>
            );
            const baseClass =
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`${baseClass} ${
                    isActive
                      ? "bg-gradient-to-r from-sunset-1/40 to-sunset-3/20 text-black dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                  }`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                disabled
                title="Coming soon"
                className={`${baseClass} cursor-default text-zinc-400 dark:text-zinc-600`}
              >
                {content}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

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
  { label: "Calendar", href: "/calendar", icon: CalendarIcon },
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
        className={`fixed inset-y-0 left-0 z-40 w-60 shrink-0 transform overflow-y-auto border-r border-white/10 bg-[#2e1c10] transition-transform duration-200 sm:static sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:hidden">
          <span className="text-sm font-semibold text-zinc-50">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10"
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
                      ? "bg-gradient-to-r from-sunset-1/30 to-sunset-3/20 text-white"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
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
                className={`${baseClass} cursor-default text-zinc-500`}
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

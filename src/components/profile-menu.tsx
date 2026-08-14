"use client";

import { useEffect, useRef, useState } from "react";

interface ProfileMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  onSignOut: () => Promise<void>;
}

export function ProfileMenu({ name, email, image, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sunset-1 via-sunset-2 to-sunset-3 text-sm font-semibold text-white shadow-sm ring-2 ring-white/60 transition-transform hover:scale-105 dark:ring-black/30"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- small remote avatar, not worth next/image config
          <img src={image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-lg border border-black/[.08] bg-white shadow-lg dark:border-white/[.145] dark:bg-zinc-900">
          {(name || email) && (
            <div className="border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
              {name && (
                <p className="truncate text-sm font-medium text-black dark:text-zinc-50">
                  {name}
                </p>
              )}
              {email && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">{email}</p>
              )}
            </div>
          )}

          <button
            type="button"
            title="Coming soon"
            className="block w-full cursor-default px-4 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Profile
          </button>
          <button
            type="button"
            title="Coming soon"
            className="block w-full cursor-default px-4 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            Theme
          </button>
          <form action={onSignOut}>
            <button
              type="submit"
              className="block w-full border-t border-black/[.08] px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:border-white/[.145] dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import { LogoMark } from "@/components/logo";
import { ProfileMenu } from "@/components/profile-menu";
import { MenuIcon } from "@/components/nav-icons";

interface TopBarProps {
  onMenuClick: () => void;
  user: { name?: string | null; email?: string | null; image?: string | null };
  onSignOut: () => Promise<void>;
}

export function TopBar({ onMenuClick, user, onSignOut }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[.08] bg-white px-4 dark:border-white/[.145] dark:bg-zinc-950 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06] sm:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-lg font-semibold text-black dark:text-zinc-50">
          Travel Planner
        </span>
      </div>

      <ProfileMenu
        name={user.name}
        email={user.email}
        image={user.image}
        onSignOut={onSignOut}
      />
    </header>
  );
}

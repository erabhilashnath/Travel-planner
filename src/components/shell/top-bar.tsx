import { LogoMark } from "@/components/logo";
import { ProfileMenu } from "@/components/shell/profile-menu";
import { MenuIcon } from "@/components/shell/nav-icons";

interface TopBarProps {
  onMenuClick: () => void;
  user: { name?: string | null; email?: string | null; image?: string | null };
  onSignOut: () => Promise<void>;
}

export function TopBar({ onMenuClick, user, onSignOut }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#2e1c10] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 sm:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <LogoMark className="h-7 w-7" />
        <span className="font-display text-lg font-semibold text-zinc-50">
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

import { signIn } from "@/server/auth";
import { LogoMark } from "@/components/logo";
import { HeroScene } from "@/components/hero-scene";
import { PageShell } from "@/components/page-shell";

const features = [
  { icon: "🗺️", label: "Plan day-by-day itineraries" },
  { icon: "💸", label: "Track shared trip expenses" },
  { icon: "✈️", label: "Save flight & hotel options" },
];

export default function SignInPage() {
  return (
    <PageShell className="lg:flex-row">
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        <HeroScene />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="font-display max-w-sm text-3xl font-medium leading-snug text-white drop-shadow-sm">
            Every trip, planned in one place.
          </p>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Itineraries, expenses, and saved flights & hotels — shared with
            the people you travel with.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <LogoMark className="h-12 w-12" />
            <h1 className="font-display text-3xl font-semibold text-black dark:text-zinc-50">
              Travel Planner
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to start planning your next trip.
            </p>
          </div>

          <ul className="flex flex-col gap-3 lg:hidden">
            {features.map((feature) => (
              <li
                key={feature.label}
                className="flex items-center gap-3 rounded-lg border border-black/[.08] bg-white px-4 py-3 text-sm text-black dark:border-white/[.145] dark:bg-zinc-950 dark:text-zinc-50"
              >
                <span className="text-lg">{feature.icon}</span>
                {feature.label}
              </li>
            ))}
          </ul>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sunset-2 to-sunset-3 px-5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12s3.36-7.27 7.19-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.19 2C6.42 2 2.03 6.8 2.03 12s4.39 10 10.16 10c5.05 0 9.81-3.62 9.81-9.94 0-.94-.14-1.6-.14-1.6z"
                />
              </svg>
              Sign in with Google
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500 lg:text-left">
            Invite-only for now — ask the trip organizer for access.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

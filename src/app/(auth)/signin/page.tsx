import { signIn } from "@/server/auth";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
            Travel Planner
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to plan trips, track expenses, and save flight & hotel
            options.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

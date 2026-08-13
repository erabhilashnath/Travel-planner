import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-1 flex-col bg-sand dark:bg-black ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-black/[.08] px-6 py-4 dark:border-white/[.145] sm:flex-row sm:items-center sm:justify-between">
      {left ? <div className="flex items-center gap-2">{left}</div> : null}
      {right ? <div className="flex items-center gap-4">{right}</div> : null}
    </header>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      ← {children}
    </Link>
  );
}

export function PageMain({
  children,
  className = "max-w-2xl",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`mx-auto w-full flex-1 px-6 py-10 ${className}`}>
      {children}
    </main>
  );
}

export function PageTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`font-display text-2xl font-semibold text-black dark:text-zinc-50 ${className}`}
    >
      {children}
    </h1>
  );
}

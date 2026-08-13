export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="16" fill="url(#logo-gradient)" />
      <path
        d="M9 17.5L23 8l-5.5 15-2.7-5.8L9 17.5z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M14.8 17.2 23 8l-8.2 9.2z" fill="white" fillOpacity="0.6" />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-sunset-1)" />
          <stop offset="0.5" stopColor="var(--color-sunset-2)" />
          <stop offset="1" stopColor="var(--color-sunset-3)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-xl font-semibold tracking-tight text-black dark:text-zinc-50 ${className}`}
    >
      Travel Planner
    </span>
  );
}

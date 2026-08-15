export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#4d2c17] via-[#603a1f] to-[#1f6089]">
      <div className="absolute inset-0">
        {[...Array(24)].map((_, i) => (
          <span
            key={i}
            className="animate-twinkle absolute block h-[2px] w-[2px] rounded-full bg-white"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 29) % 70}%`,
              animationDelay: `${(i % 6) * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="animate-drift absolute -left-24 top-10 h-96 w-96 rounded-full bg-sunset-2/25 blur-3xl" />
      <div
        className="animate-drift absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-sunset-3/20 blur-3xl"
        style={{ animationDelay: "4s", animationDirection: "alternate-reverse" }}
      />
      <div
        className="animate-drift absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-sunset-1/15 blur-3xl"
        style={{ animationDelay: "8s" }}
      />

      <svg className="absolute bottom-0 left-0 w-full text-black/40" viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0 120 L60 55 L110 90 L170 30 L230 90 L290 45 L340 90 L400 60 L400 120 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full text-black/25" viewBox="0 0 400 90" preserveAspectRatio="none">
        <path d="M0 90 L50 40 L100 70 L160 20 L220 65 L280 35 L340 75 L400 45 L400 90 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

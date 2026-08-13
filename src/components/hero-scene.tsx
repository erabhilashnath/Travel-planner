export function HeroScene() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sunset-1 via-sunset-2 to-sunset-3">
      {/* stars, visible mainly where the gradient darkens at the bottom */}
      <div className="absolute inset-0">
        {[...Array(18)].map((_, i) => (
          <span
            key={i}
            className="animate-twinkle absolute block h-[3px] w-[3px] rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 55}%`,
              animationDelay: `${(i % 6) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* sun */}
      <div className="absolute right-[15%] top-[18%] h-20 w-20 rounded-full bg-white/90 shadow-[0_0_80px_30px_rgba(255,255,255,0.35)]" />

      {/* clouds */}
      <svg
        className="animate-drift absolute left-[8%] top-[30%] h-auto w-40 opacity-90"
        viewBox="0 0 120 40"
        fill="white"
      >
        <ellipse cx="30" cy="25" rx="28" ry="14" />
        <ellipse cx="60" cy="18" rx="22" ry="16" />
        <ellipse cx="85" cy="26" rx="20" ry="11" />
      </svg>
      <svg
        className="animate-drift absolute right-[20%] top-[45%] h-auto w-28 opacity-70"
        style={{ animationDelay: "3s", animationDirection: "alternate-reverse" }}
        viewBox="0 0 120 40"
        fill="white"
      >
        <ellipse cx="30" cy="25" rx="28" ry="14" />
        <ellipse cx="60" cy="18" rx="22" ry="16" />
        <ellipse cx="85" cy="26" rx="20" ry="11" />
      </svg>

      {/* flying plane with dashed trail */}
      <div className="animate-fly absolute left-0 top-0 h-8 w-8 text-white">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.5 19.5 21 4l-6 17-3-6.5-9-1z" />
        </svg>
      </div>

      {/* mountains */}
      <svg
        className="absolute bottom-0 left-0 w-full text-ocean-2/80"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
      >
        <path d="M0 120 L60 55 L110 90 L170 30 L230 90 L290 45 L340 90 L400 60 L400 120 Z" fill="currentColor" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full text-ocean-1"
        viewBox="0 0 400 90"
        preserveAspectRatio="none"
      >
        <path d="M0 90 L50 40 L100 70 L160 20 L220 65 L280 35 L340 75 L400 45 L400 90 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

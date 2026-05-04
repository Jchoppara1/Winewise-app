import { useState, useEffect, useRef } from "react";

const IMAGES = ["/splash/food-1.jpg", "/splash/food-2.jpg", "/splash/food-3.jpg"];
const TOTAL_DURATION = 2200;
const IMAGE_INTERVAL = 700;
const EXIT_DURATION = 300;

interface SplashIntroProps {
  onDone: () => void;
}

export function SplashIntro({ onDone }: SplashIntroProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const [imageIndex, setImageIndex] = useState(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const duration = reducedMotion.current ? 1200 : TOTAL_DURATION;

    const enterTimer = setTimeout(() => setPhase("show"), 80);

    const imageTimers: ReturnType<typeof setTimeout>[] = [];
    if (!reducedMotion.current) {
      for (let i = 1; i < IMAGES.length; i++) {
        imageTimers.push(setTimeout(() => setImageIndex(i), IMAGE_INTERVAL * i));
      }
    }

    const exitTimer = setTimeout(() => setPhase("exit"), duration);
    const doneTimer = setTimeout(onDone, duration + EXIT_DURATION);

    return () => {
      clearTimeout(enterTimer);
      imageTimers.forEach(clearTimeout);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const isReduced = reducedMotion.current;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden"
      style={{
        opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
        transition: `opacity ${phase === "exit" ? EXIT_DURATION : 150}ms ease-out`,
      }}
      data-testid="splash-overlay"
    >
      {IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === imageIndex ? 1 : 0,
            transition: `opacity ${isReduced ? 200 : 500}ms ease-in-out`,
            transform: !isReduced && phase === "show" ? "scale(1.05)" : "scale(1.02)",
            transitionProperty: "opacity, transform",
            transitionDuration: `${isReduced ? 200 : 500}ms, ${TOTAL_DURATION}ms`,
            transitionTimingFunction: "ease-in-out, ease-out",
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(var(--background) / 0.82) 0%,
            hsl(var(--blush) / 0.65) 40%,
            hsl(var(--background) / 0.78) 100%
          )`,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <div
          className="flex flex-col items-center gap-2"
          style={{
            opacity: phase === "show" ? 1 : 0,
            transform: phase === "show" ? "translateY(0)" : "translateY(8px)",
            transition: isReduced
              ? "opacity 200ms ease-out"
              : "opacity 350ms ease-out, transform 350ms ease-out",
          }}
        >
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-wide"
            style={{ color: "hsl(var(--foreground))" }}
            data-testid="splash-title"
          >
            Welcome to Del Bar
          </h1>
          <p
            className="text-sm sm:text-base tracking-[0.25em] uppercase font-light"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Middle Eastern &bull; Mediterranean
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <div
            className="h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--olive)), transparent)`,
              transform: phase === "show" && !isReduced ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 400ms ease-out 200ms",
            }}
          />
          <div
            className="h-px w-3/4"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)`,
              transform: phase === "show" && !isReduced ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 350ms ease-out 350ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}

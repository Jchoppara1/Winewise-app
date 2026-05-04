const base = import.meta.env.BASE_URL;

export default function GuestExperience() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <img
        src={`${base}food-2.jpg`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Restaurant experience"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(28,46,26,0.92) 50%, rgba(28,46,26,0.6) 100%)" }} />
      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[3vh]">
          GUEST EXPERIENCE
        </p>
        <h2 className="font-display font-bold text-cream text-[4.5vw] leading-tight tracking-tight mb-[5vh]">
          Confidence at Every Table
        </h2>
        <div className="flex flex-col gap-[3vh]">
          <div className="flex items-start gap-[2vw]">
            <div className="w-[0.4vw] h-[3vh] bg-accent mt-[0.5vh] shrink-0" />
            <p className="font-body text-cream text-[1.8vw] leading-relaxed">
              Servers recommend pairings without memorizing 60+ labels — the platform does the work.
            </p>
          </div>
          <div className="flex items-start gap-[2vw]">
            <div className="w-[0.4vw] h-[3vh] bg-accent mt-[0.5vh] shrink-0" />
            <p className="font-body text-cream text-[1.8vw] leading-relaxed">
              Guests explore the wine list with context — tasting notes, food matches, and price tiers visible at a glance.
            </p>
          </div>
          <div className="flex items-start gap-[2vw]">
            <div className="w-[0.4vw] h-[3vh] bg-accent mt-[0.5vh] shrink-0" />
            <p className="font-body text-cream text-[1.8vw] leading-relaxed">
              Staff training time drops — the platform onboards new team members faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

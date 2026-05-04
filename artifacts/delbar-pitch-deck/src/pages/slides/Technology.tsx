export default function Technology() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-dark flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[2vh]">
        UNDER THE HOOD
      </p>
      <h2 className="font-display font-bold text-cream text-[4vw] leading-tight tracking-tight mb-[8vh]">
        Platform Architecture
      </h2>
      <div className="flex gap-[4vw] flex-1">
        <div className="flex-1">
          <p className="font-display font-bold text-accent text-[3vw] mb-[2vh]">01</p>
          <p className="font-body font-bold text-cream text-[1.6vw] tracking-wide uppercase mb-[1.5vh]">
            Classification Engine
          </p>
          <p className="font-body text-cream text-[1.7vw] leading-relaxed" style={{ opacity: 0.75 }}>
            8-category wine classifier automatically assigns type, price tier, and serving format to each label.
          </p>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-accent text-[3vw] mb-[2vh]">02</p>
          <p className="font-body font-bold text-cream text-[1.6vw] tracking-wide uppercase mb-[1.5vh]">
            Scoring Algorithm
          </p>
          <p className="font-body text-cream text-[1.7vw] leading-relaxed" style={{ opacity: 0.75 }}>
            2,442 pairings evaluated on every load — results sorted by match score, never cached stale.
          </p>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-accent text-[3vw] mb-[2vh]">03</p>
          <p className="font-body font-bold text-cream text-[1.6vw] tracking-wide uppercase mb-[1.5vh]">
            Live Data Layer
          </p>
          <p className="font-body text-cream text-[1.7vw] leading-relaxed" style={{ opacity: 0.75 }}>
            CSV-backed in-memory store — zero database infrastructure, instant reads, simple updates.
          </p>
        </div>
      </div>
    </div>
  );
}

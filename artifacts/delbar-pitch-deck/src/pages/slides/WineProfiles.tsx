export default function WineProfiles() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[7vh]">
        Wine Detail Views
      </h2>
      <div className="flex gap-[4vw] flex-1">
        <div className="flex-1">
          <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-primary flex items-center justify-center mb-[2.5vh]">
            <span className="font-display font-bold text-cream text-[1.8vw]">T</span>
          </div>
          <p className="font-body font-bold text-primary text-[1.5vw] tracking-wide uppercase mb-[1.5vh]">
            Tasting Profile
          </p>
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            Structured tasting notes covering sweetness, acidity, tannin, body, and finish for every bottle.
          </p>
        </div>
        <div className="flex-1">
          <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-burgundy flex items-center justify-center mb-[2.5vh]">
            <span className="font-display font-bold text-cream text-[1.8vw]">A</span>
          </div>
          <p className="font-body font-bold text-primary text-[1.5vw] tracking-wide uppercase mb-[1.5vh]">
            Aroma Notes
          </p>
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            Curated aroma descriptors — fruit, earth, oak, floral — that help staff speak confidently about each wine.
          </p>
        </div>
        <div className="flex-1">
          <div className="w-[3.5vw] h-[3.5vw] rounded-full bg-accent flex items-center justify-center mb-[2.5vh]">
            <span className="font-display font-bold text-cream text-[1.8vw]">S</span>
          </div>
          <p className="font-body font-bold text-primary text-[1.5vw] tracking-wide uppercase mb-[1.5vh]">
            Serving Guidance
          </p>
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            Temperature, glassware, and decanting recommendations for each wine style.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FoodPairings() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex" style={{ backgroundColor: "#722F37" }}>
      <div className="flex flex-col justify-center px-[8vw] w-[42vw]">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[3vh]">
          PAIRING ALGORITHM
        </p>
        <h2 className="font-display font-bold text-cream text-[4.5vw] leading-tight tracking-tight" style={{ textWrap: "balance" }}>
          6-Dimension Scoring System
        </h2>
        <div className="mt-[3vh] w-[6vw] h-[0.3vh] bg-accent" />
        <p className="mt-[3vh] font-body text-cream text-[1.8vw] leading-relaxed" style={{ opacity: 0.8 }}>
          Every wine is evaluated against every dish across six distinct dimensions, producing a ranked match score.
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-[2vh] pr-[7vw] pl-[4vw]">
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">1</span>
          <span className="font-body text-cream text-[1.8vw]">Flavor Profile</span>
        </div>
        <div className="w-full h-[0.1vh] bg-cream" style={{ opacity: 0.15 }} />
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">2</span>
          <span className="font-body text-cream text-[1.8vw]">Tannin Structure</span>
        </div>
        <div className="w-full h-[0.1vh] bg-cream" style={{ opacity: 0.15 }} />
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">3</span>
          <span className="font-body text-cream text-[1.8vw]">Acidity Balance</span>
        </div>
        <div className="w-full h-[0.1vh] bg-cream" style={{ opacity: 0.15 }} />
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">4</span>
          <span className="font-body text-cream text-[1.8vw]">Body Weight</span>
        </div>
        <div className="w-full h-[0.1vh] bg-cream" style={{ opacity: 0.15 }} />
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">5</span>
          <span className="font-body text-cream text-[1.8vw]">Regional Affinity</span>
        </div>
        <div className="w-full h-[0.1vh] bg-cream" style={{ opacity: 0.15 }} />
        <div className="flex items-baseline gap-[2vw]">
          <span className="font-display font-bold text-accent text-[2.5vw] w-[3vw]">6</span>
          <span className="font-body text-cream text-[1.8vw]">Preparation Method</span>
        </div>
      </div>
    </div>
  );
}

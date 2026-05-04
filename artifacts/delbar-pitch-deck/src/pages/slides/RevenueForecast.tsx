export default function RevenueForecast() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[7vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[3.8vw] leading-tight tracking-tight mb-[2vh]">
        Projected Annual Revenue Lift
      </h2>
      <p className="font-body text-muted text-[1.6vw] mb-[6vh]">
        Assumptions: 1,500 covers/month — $45 average wine spend per cover
      </p>
      <div className="flex flex-col gap-[3.5vh] flex-1 justify-center">
        <div>
          <div className="flex items-center justify-between mb-[1vh]">
            <span className="font-body text-muted text-[1.6vw]">Without Platform</span>
            <span className="font-body font-bold text-muted text-[1.6vw]">$810K / year</span>
          </div>
          <div className="w-full h-[3.5vh] rounded" style={{ backgroundColor: "#E8E3D8" }}>
            <div className="h-full rounded" style={{ width: "68%", backgroundColor: "#8A7060" }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-[1vh]">
            <span className="font-body text-primary font-bold text-[1.6vw]">Conservative (+20%)</span>
            <span className="font-body font-bold text-primary text-[1.6vw]">$972K / year</span>
          </div>
          <div className="w-full h-[3.5vh] rounded" style={{ backgroundColor: "#E8E3D8" }}>
            <div className="h-full rounded bg-primary" style={{ width: "82%" }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-[1vh]">
            <span className="font-body text-burgundy font-bold text-[1.6vw]">Optimistic (+30%)</span>
            <span className="font-body font-bold text-burgundy text-[1.6vw]">$1.05M / year</span>
          </div>
          <div className="w-full h-[3.5vh] rounded" style={{ backgroundColor: "#E8E3D8" }}>
            <div className="h-full rounded bg-burgundy" style={{ width: "88%" }} />
          </div>
        </div>
      </div>
      <div className="mt-[4vh] flex items-baseline gap-[3vw]">
        <p className="font-body text-accent font-bold text-[2vw]">
          +$162K to +$243K per year
        </p>
        <p className="font-body text-muted text-[1.6vw]">
          ($13,500 to $20,250 per month)
        </p>
      </div>
    </div>
  );
}

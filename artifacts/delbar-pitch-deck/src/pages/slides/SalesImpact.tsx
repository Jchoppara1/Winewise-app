export default function SalesImpact() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col justify-center items-center px-[8vw]">
      <p className="font-body text-[1.5vw] tracking-[0.3em] text-primary uppercase mb-[4vh]">
        INDUSTRY RESEARCH
      </p>
      <p className="font-display font-bold text-burgundy text-[12vw] leading-none tracking-tight">
        +20–30%
      </p>
      <div className="mt-[3vh] w-[8vw] h-[0.3vh] bg-accent" />
      <p className="mt-[4vh] font-body text-text text-[2vw] text-center" style={{ maxWidth: "55vw", textWrap: "balance" }}>
        average check increase from guided wine recommendations at table service
      </p>
      <p className="mt-[5vh] font-body text-muted text-[1.5vw] tracking-wide">
        Restaurant industry research — National Restaurant Association, 2024
      </p>
    </div>
  );
}

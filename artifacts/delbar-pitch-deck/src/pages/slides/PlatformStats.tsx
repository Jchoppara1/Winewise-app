export default function PlatformStats() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[8vh]">
        Platform at a Glance
      </h2>
      <div className="flex gap-[3vw] flex-1">
        <div className="flex-1 flex flex-col">
          <p className="font-display font-bold text-burgundy text-[7vw] leading-none">66</p>
          <p className="font-body text-muted text-[1.5vw] tracking-widest uppercase mt-[1.5vh]">Wines in Catalog</p>
          <div className="w-[3vw] h-[0.25vh] bg-burgundy mt-[2vh]" />
        </div>
        <div className="w-[0.1vw] bg-text" style={{ opacity: 0.1 }} />
        <div className="flex-1 flex flex-col">
          <p className="font-display font-bold text-burgundy text-[7vw] leading-none">37</p>
          <p className="font-body text-muted text-[1.5vw] tracking-widest uppercase mt-[1.5vh]">Food Dishes</p>
          <div className="w-[3vw] h-[0.25vh] bg-burgundy mt-[2vh]" />
        </div>
        <div className="w-[0.1vw] bg-text" style={{ opacity: 0.1 }} />
        <div className="flex-1 flex flex-col">
          <p className="font-display font-bold text-primary text-[7vw] leading-none">2,442</p>
          <p className="font-body text-muted text-[1.5vw] tracking-widest uppercase mt-[1.5vh]">Pairings Evaluated</p>
          <div className="w-[3vw] h-[0.25vh] bg-primary mt-[2vh]" />
        </div>
        <div className="w-[0.1vw] bg-text" style={{ opacity: 0.1 }} />
        <div className="flex-1 flex flex-col">
          <p className="font-display font-bold text-primary text-[7vw] leading-none">99%</p>
          <p className="font-body text-muted text-[1.5vw] tracking-widest uppercase mt-[1.5vh]">Pairing Coverage</p>
          <div className="w-[3vw] h-[0.25vh] bg-primary mt-[2vh]" />
        </div>
      </div>
    </div>
  );
}

export default function ThePlatform() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[7vh]" style={{ textWrap: "balance" }}>
        A Complete Wine & Food Platform
      </h2>
      <div className="flex gap-[4vw] flex-1">
        <div className="flex-1 flex flex-col">
          <p className="font-body font-bold text-primary text-[1.6vw] tracking-wide uppercase mb-[2vh]">
            Wine Catalog
          </p>
          <div className="w-full h-[0.2vh] bg-primary mb-[2.5vh]" style={{ opacity: 0.3 }} />
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            66 bottles and 23 by-glass wines organized across 8 categories, with tasting notes and price tiers.
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <p className="font-body font-bold text-primary text-[1.6vw] tracking-wide uppercase mb-[2vh]">
            Pairing Engine
          </p>
          <div className="w-full h-[0.2vh] bg-primary mb-[2.5vh]" style={{ opacity: 0.3 }} />
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            6-dimension algorithm matches every wine against 37 food dishes, scored and ranked automatically.
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <p className="font-body font-bold text-primary text-[1.6vw] tracking-wide uppercase mb-[2vh]">
            Admin Tools
          </p>
          <div className="w-full h-[0.2vh] bg-primary mb-[2.5vh]" style={{ opacity: 0.3 }} />
          <p className="font-body text-text text-[1.7vw] leading-relaxed">
            Secure inventory management with stock status, label editing, and session-protected access.
          </p>
        </div>
      </div>
    </div>
  );
}

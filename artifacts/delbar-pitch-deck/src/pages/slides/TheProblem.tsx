export default function TheProblem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[6vh]" style={{ textWrap: "balance" }}>
        Restaurant Wine Programs Fall Short
      </h2>
      <div className="flex gap-[5vw] flex-1">
        <div className="flex-1">
          <p className="font-body font-bold text-accent text-[1.5vw] tracking-widest uppercase mb-[2.5vh]">
            Guest-Facing Gaps
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed mb-[2vh]">
            Static paper menus offer no pairing context — guests choose by price, not fit.
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed">
            Staff cannot confidently recommend across 60+ labels without extensive training.
          </p>
        </div>
        <div className="w-[0.1vw] bg-text" style={{ opacity: 0.12 }} />
        <div className="flex-1">
          <p className="font-body font-bold text-accent text-[1.5vw] tracking-widest uppercase mb-[2.5vh]">
            Operational Friction
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed mb-[2vh]">
            Inventory is tracked on spreadsheets — stock-outs happen silently, mid-service.
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed">
            No visibility into which wines pair best with the food menu being served.
          </p>
        </div>
      </div>
    </div>
  );
}

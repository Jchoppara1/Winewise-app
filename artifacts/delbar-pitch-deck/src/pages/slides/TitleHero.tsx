const base = import.meta.env.BASE_URL;

export default function TitleHero() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <img
        src={`${base}hero-wine.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Wine and dining"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, #1C2E1A 55%, rgba(28,46,26,0.5) 100%)" }} />
      <div className="absolute inset-0 flex flex-col justify-center px-[8vw]">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[3vh]">
          A DEL BAR PLATFORM
        </p>
        <h1 className="font-display font-bold text-cream leading-none tracking-tight text-[7vw]" style={{ textWrap: "balance" }}>
          Del Bar Wine & Dine
        </h1>
        <div className="mt-[3vh] w-[7vw] h-[0.3vh] bg-accent" />
        <p className="mt-[3.5vh] font-body text-[2vw] text-cream" style={{ opacity: 0.8 }}>
          Intelligent Wine & Food Platform
        </p>
      </div>
      <div className="absolute bottom-[4vh] right-[6vw] font-body text-[1.5vw] tracking-widest" style={{ color: "rgba(242,237,229,0.4)" }}>
        2026
      </div>
    </div>
  );
}

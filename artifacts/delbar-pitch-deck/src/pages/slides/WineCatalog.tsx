export default function WineCatalog() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-dark flex">
      <div className="flex flex-col justify-center px-[8vw] w-[45vw]">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[2vh]">
          THE COLLECTION
        </p>
        <p className="font-display font-bold text-cream text-[10vw] leading-none tracking-tight">
          66
        </p>
        <p className="font-display text-cream text-[2.5vw] leading-tight mt-[1vh]">
          Bottles in the Catalog
        </p>
        <div className="mt-[3vh] w-[6vw] h-[0.3vh] bg-accent" />
        <p className="font-body text-cream text-[1.8vw] mt-[3vh]" style={{ opacity: 0.7 }}>
          23 additional wines available by the glass
        </p>
      </div>
      <div className="flex-1 flex flex-col justify-center pr-[7vw] gap-[1.8vh]">
        <p className="font-body font-bold text-accent text-[1.5vw] tracking-widest uppercase mb-[1vh]">
          WINE TYPES
        </p>
        <div className="flex items-center gap-[2vw]">
          <span className="font-display font-bold text-cream text-[3.5vw] w-[5vw] text-right">34</span>
          <span className="font-body text-cream text-[1.8vw]" style={{ opacity: 0.8 }}>Red</span>
        </div>
        <div className="flex items-center gap-[2vw]">
          <span className="font-display font-bold text-cream text-[3.5vw] w-[5vw] text-right">17</span>
          <span className="font-body text-cream text-[1.8vw]" style={{ opacity: 0.8 }}>White</span>
        </div>
        <div className="flex items-center gap-[2vw]">
          <span className="font-display font-bold text-cream text-[3.5vw] w-[5vw] text-right">9</span>
          <span className="font-body text-cream text-[1.8vw]" style={{ opacity: 0.8 }}>Sparkling</span>
        </div>
        <div className="flex items-center gap-[2vw]">
          <span className="font-display font-bold text-cream text-[3.5vw] w-[5vw] text-right">4</span>
          <span className="font-body text-cream text-[1.8vw]" style={{ opacity: 0.8 }}>Rosé</span>
        </div>
        <div className="flex items-center gap-[2vw]">
          <span className="font-display font-bold text-cream text-[3.5vw] w-[5vw] text-right">2</span>
          <span className="font-body text-cream text-[1.8vw]" style={{ opacity: 0.8 }}>Orange & Dessert</span>
        </div>
      </div>
    </div>
  );
}

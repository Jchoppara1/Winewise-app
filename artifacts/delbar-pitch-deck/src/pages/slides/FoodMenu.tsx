const base = import.meta.env.BASE_URL;

export default function FoodMenu() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex">
      <div className="w-[52vw] relative overflow-hidden">
        <img
          src={`${base}food-1.jpg`}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Middle Eastern cuisine"
        />
      </div>
      <div className="flex-1 bg-cream flex flex-col justify-center px-[5vw]">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[3vh]">
          THE MENU
        </p>
        <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[3vh]" style={{ textWrap: "balance" }}>
          37 Middle Eastern Dishes
        </h2>
        <div className="w-[5vw] h-[0.3vh] bg-primary mb-[3.5vh]" />
        <p className="font-body text-text text-[1.7vw] leading-relaxed mb-[2.5vh]">
          From lamb kofta to herb-roasted sea bass, every dish is cross-referenced against the full wine list.
        </p>
        <p className="font-body text-text text-[1.7vw] leading-relaxed">
          Pairing works in both directions — start with a wine or start with a dish.
        </p>
      </div>
    </div>
  );
}

const base = import.meta.env.BASE_URL;

export default function Closing() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-dark flex flex-col justify-center items-center text-center px-[10vw]">
      <div className="absolute inset-0 opacity-10">
        <img
          src={`${base}food-3.jpg`}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div className="relative flex flex-col items-center">
        <p className="font-body text-[1.5vw] tracking-[0.3em] text-accent uppercase mb-[4vh]">
          DEL BAR RESTAURANT
        </p>
        <h2 className="font-display font-bold text-cream text-[5.5vw] leading-none tracking-tight mb-[3vh]">
          Del Bar Wine & Dine
        </h2>
        <div className="w-[8vw] h-[0.3vh] bg-accent mb-[4vh]" />
        <p className="font-display italic text-cream text-[2.2vw] leading-relaxed mb-[6vh]" style={{ opacity: 0.8 }}>
          Where every glass tells a story.
        </p>
        <p className="font-body text-cream text-[1.7vw]" style={{ opacity: 0.65 }}>
          Contact us to schedule a full platform walkthrough.
        </p>
      </div>
    </div>
  );
}

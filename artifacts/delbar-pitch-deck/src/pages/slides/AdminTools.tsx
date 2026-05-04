export default function AdminTools() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-cream flex flex-col px-[8vw] pt-[8vh] pb-[6vh]">
      <div className="w-[5vw] h-[0.3vh] bg-primary mb-[2.5vh]" />
      <h2 className="font-display font-bold text-text text-[4vw] leading-tight tracking-tight mb-[7vh]">
        Inventory Management
      </h2>
      <div className="flex gap-[5vw] flex-1">
        <div className="flex-1 flex flex-col">
          <p className="font-body font-bold text-accent text-[1.5vw] tracking-widest uppercase mb-[2.5vh]">
            Stock Control
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed mb-[2.5vh]">
            Mark bottles as in stock or unavailable in real time — guests only see what the cellar holds.
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed">
            Edit wine labels, vintages, pricing, and descriptions without a developer.
          </p>
        </div>
        <div className="w-[0.1vw] bg-text" style={{ opacity: 0.12 }} />
        <div className="flex-1 flex flex-col">
          <p className="font-body font-bold text-accent text-[1.5vw] tracking-widest uppercase mb-[2.5vh]">
            Secure Access
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed mb-[2.5vh]">
            Session-protected login with rate limiting — admin access is locked after 5 failed attempts.
          </p>
          <p className="font-body text-text text-[1.8vw] leading-relaxed">
            No customer-facing data is ever exposed through the admin interface.
          </p>
        </div>
      </div>
    </div>
  );
}

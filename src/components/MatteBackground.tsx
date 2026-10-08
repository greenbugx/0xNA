import FizzingParticles from "./FizzingParticles";

export default function MatteBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#09090b]" />

      <div
        style={{
          backgroundImage: "url('/matte-grain.webp')",
          backgroundRepeat: "repeat",
          imageRendering: "pixelated",
        }}
        className="absolute inset-0 opacity-90"
      />

      <FizzingParticles speed={0.3} />

      <span
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0 1px, transparent 1px 3px)",
        }}
        className="absolute inset-0 opacity-35"
      />
    </div>
  );
}

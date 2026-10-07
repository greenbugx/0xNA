export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 pb-36 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <main className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-zinc-100 max-w-2xl leading-[1.15]">
          Something is going to be added here soon. <span className="text-zinc-500">Stay tuned.</span>
        </h1>
      </main>
    </div>
  );
}

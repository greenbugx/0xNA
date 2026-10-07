import ProfileHeader from "@/components/ProfileHeader";
import AboutMe from "@/components/AboutMe";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 pt-8 sm:pt-12 pb-36 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <div className="relative z-20 w-full max-w-2xl -translate-x-8 sm:-translate-x-16 md:-translate-x-32 lg:-translate-x-48 xl:-translate-x-64 flex flex-col gap-4 sm:gap-5">
        <ProfileHeader />
        <main>
          <AboutMe />
        </main>
      </div>
    </div>
  );
}

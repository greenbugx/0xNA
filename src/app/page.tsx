import ProfileHeader from "@/components/ProfileHeader";
import AboutMe from "@/components/AboutMe";
import Timeline from "@/components/Timeline";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import Hackathons from "@/components/Hackathons";
import GithubHeatmap from "@/components/GithubHeatmap";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 pt-8 sm:pt-12 pb-36 overflow-hidden">
      <div className="relative z-20 w-full max-w-2xl -translate-x-8 sm:-translate-x-16 md:-translate-x-32 lg:-translate-x-48 xl:-translate-x-64 flex flex-col gap-4 sm:gap-5">
        <ProfileHeader />
        <main className="flex flex-col gap-2">
          <AboutMe />
          <Timeline />
          <TechStack />
          <Projects />
          <Hackathons />
          <GithubHeatmap />
          <div className="w-full pt-14 sm:pt-16 pb-4 text-center flex flex-col items-center justify-center gap-1 select-none">
            <p className="text-xs sm:text-sm text-zinc-500">
              Two last things are going to be added
            </p>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Soon
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

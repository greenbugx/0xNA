import ProfileHeader from "@/components/ProfileHeader";
import AboutMe from "@/components/AboutMe";
import Timeline from "@/components/Timeline";
import TechStack from "@/components/TechStack";
import Projects from "@/components/Projects";
import Hackathons from "@/components/Hackathons";
import GithubHeatmap from "@/components/GithubHeatmap";
import Contact from "@/components/Contact";
import { getGithubContributionCalendar } from "@/lib/github";
import type { ContributionCalendar } from "@/lib/github";

export default async function Home() {
  let calendar: ContributionCalendar | null = null;

  try {
    calendar = await getGithubContributionCalendar();
  } catch (error) {
    console.error("GitHub contribution calendar failed:", error);
    calendar = null;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 sm:px-6 pt-6 sm:pt-12 pb-36 overflow-x-hidden w-full max-w-full">
      <div className="relative z-20 w-full max-w-2xl translate-x-0 lg:-translate-x-20 xl:-translate-x-44 2xl:-translate-x-64 flex flex-col gap-4 sm:gap-5">
        <ProfileHeader />
        <main className="flex flex-col gap-2">
          <AboutMe />
          <Projects />
          <TechStack />
          <Timeline />
          <Hackathons />
          <GithubHeatmap calendar={calendar} />
          <Contact />
        </main>
      </div>
    </div>
  );
}

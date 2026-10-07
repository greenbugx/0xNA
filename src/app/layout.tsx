import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Dock from "@/components/Dock";
import MatteBackground from "@/components/MatteBackground";
import LoadingScreen from "@/components/LoadingScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = localFont({
  src: "../assets/fonts/PlayfairDisplay.ttf",
  variable: "--font-playfairdisplay",
  display: "swap",
});

const googleSans = localFont({
  src: "../assets/fonts/GoogleSans-VariableFont_GRAD.ttf",
  variable: "--font-google-sans",
  display: "swap",
});

const googleSansItalic = localFont({
  src: "../assets/fonts/GoogleSans-Italic.ttf",
  variable: "--font-google-sans-italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "0xNA",
  description: "Personal Portfolio and Projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${googleSans.variable} ${googleSansItalic.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#ededed]">
        <MatteBackground />
        <LoadingScreen>
          <div className="relative z-10 flex flex-col flex-1">
            {children}
          </div>
          <Dock />
        </LoadingScreen>
      </body>
    </html>
  );
}

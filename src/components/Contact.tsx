import React from "react";
import { Mail } from "lucide-react";
import CalBookingButton from "./CalBookingButton";
import VisitorCounter from "./VisitorCounter";

export default function Contact() {
  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none flex flex-col items-center text-center">
      <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight">
        Have a project in mind?
      </h2>

      <p className="text-sm sm:text-[15px] text-zinc-400 mt-2.5 max-w-md leading-[1.7] sm:leading-[1.75]">
        Book a call to discuss the details or email me your requirements.
      </p>

      <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
        <CalBookingButton />

        <a
          href="mailto:greenbugx@proton.me"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-xs font-medium text-zinc-300 hover:text-white transition-colors shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <Mail className="w-3.5 h-3.5 text-zinc-400" />
          <span>Send Email</span>
        </a>
      </div>

      <VisitorCounter />
    </section>
  );
}

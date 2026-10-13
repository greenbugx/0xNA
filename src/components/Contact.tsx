import React from "react";
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

      <div className="flex items-center justify-center mt-5">
        <CalBookingButton />
      </div>

      <VisitorCounter />
    </section>
  );
}

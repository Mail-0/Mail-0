"use client";

import HeroImage from "@/components/home/hero-image";
import Navbar from "@/components/home/navbar";
import Hero from "@/components/home/hero";

export default function Home() {
  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden bg-grid-small-black/[0.39] dark:bg-grid-small-white/[0.025]">
      <div className="relative mx-auto mb-4 flex max-w-7xl flex-col">
        <Navbar />
        <Hero />
        <HeroImage />
      </div>
    </div>
  );
}

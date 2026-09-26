"use client";

import { useState, useEffect } from "react";
import SideRailNav, { type SectionId } from "@/components/navigation/SideRailNav";
import Starfield from "@/components/ui/starfield-1";
import DeconstructedPacketHero from "@/components/hero/DeconstructedPacketHero";
import AimSection from "@/components/sections/AimSection";
import TheorySection from "@/components/sections/TheorySection";
import PreTestSection from "@/components/sections/PreTestSection";
import PostTestSection from "@/components/sections/PostTestSection";
import FunRoutingSimulators from "@/components/simulations/FunRoutingSimulators";
import RoutingLogo from "@/components/brand/RoutingLogo";

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [starfieldOpacity, setStarfieldOpacity] = useState<number>(0);
  const [showNavRail, setShowNavRail] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "history" in window && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      // Safari private mode / strict context fallback
    }

    // Instant cross-browser scroll reset to top
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sectionIds: SectionId[] = ["hero", "aim", "theory", "pretest", "simulation", "posttest"];
    let ticking = false;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroEl = document.getElementById("hero");
      
      // 1. Calculate Starfield opacity & Nav visibility:
      // In the hero section, opacity is 0 (pure pitch-black, zero stars) and menu is hidden.
      // As the user scrolls into the main page, smoothly fade Starfield to full 1.0 and show the menu bar.
      if (heroEl) {
        const heroHeight = heroEl.offsetHeight;
        // Start fading in when approaching bottom of hero (last 40% of hero scroll)
        const fadeStart = heroHeight * 0.55;
        const fadeEnd = heroHeight * 0.95;

        if (scrollY <= fadeStart) {
          setStarfieldOpacity(0);
        } else if (scrollY >= fadeEnd) {
          setStarfieldOpacity(1);
        } else {
          const ratio = (scrollY - fadeStart) / (fadeEnd - fadeStart);
          setStarfieldOpacity(Math.min(1, Math.max(0, ratio)));
        }

        // Show navigation menu bar ONLY after finishing the hero scroll (entering main website)
        setShowNavRail(scrollY >= heroHeight * 0.7);
      }

      // 2. Bottom-of-page check: snap to last section ("posttest") when reaching the bottom
      const isBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 80;
      if (isBottom) {
        setActiveSection("posttest");
        ticking = false;
        return;
      }

      // 3. Hero scroll section check
      if (heroEl && scrollY < heroEl.offsetHeight * 0.65) {
        setActiveSection("hero");
        ticking = false;
        return;
      }

      // 4. Main website active section calculation using TRUE document coordinates
      // getBoundingClientRect().top + scrollY gives absolute document top coordinate
      // regardless of parent CSS position:relative/sticky offsets
      const focalLine = scrollY + window.innerHeight * 0.35;

      for (let i = sectionIds.length - 1; i >= 1; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const absoluteTop = el.getBoundingClientRect().top + scrollY;
          if (focalLine >= absoluteTop) {
            setActiveSection(id);
            ticking = false;
            return;
          }
        }
      }

      setActiveSection("hero");
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial evaluation on mount

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-200 selection:bg-white selection:text-black">
      {/* 
        Ambient Cosmic Starfield Canvas:
        - Runs continuously at 60+ FPS (never pauses while scrolling)
        - Strictly 0% opacity in Hero scroll section (zero background/stars)
        - Smoothly fades to 100% full visibility as you scroll to the main page
      */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 ease-out"
        style={{ opacity: starfieldOpacity }}
      >
        <Starfield
          quantity={350}
          speed={0.45}
          starColor="rgba(255, 255, 255, 0.95)"
          bgColor="#000000"
          mouseAdjust={true}
          clickToWarp={false}
          className="size-full"
        />
      </div>

      {/* Fixed Left-Side Rail Menu: Appears only after finishing hero scroll */}
      <SideRailNav activeSection={activeSection} onSelectSection={scrollTo} visible={showNavRail} />

      {/* ========================================================
          1. HERO SECTION: 100% FULL-WIDTH PITCH BLACK (ZERO STARS)
         ======================================================== */}
      <section 
        id="hero" 
        className="relative z-20 w-full bg-black min-h-screen isolate"
        style={{ backgroundColor: "#000000" }}
      >
        <DeconstructedPacketHero />
      </section>

      {/* ========================================================
          2. MAIN WORKSPACE: STARFIELD FULLY VISIBLE & ACTIVE
          Desktop offset (pl-0 lg:pl-64) ensures side rail clearance
         ======================================================== */}
      <div className="pl-0 lg:pl-64 transition-all duration-300 relative z-10 w-full">
        {/* Subtle top edge fade transitioning into main page */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />

        {/* Lab Workspace Content: Simulation strictly between Pre-Test and Post-Test */}
        <main className="max-w-5xl mx-auto px-6 py-24 flex flex-col gap-32 relative z-10">
          <section id="aim" className="scroll-mt-28">
            <AimSection />
          </section>
          <section id="theory" className="scroll-mt-28">
            <TheorySection />
          </section>
          <section id="pretest" className="scroll-mt-28">
            <PreTestSection />
          </section>
          <section id="simulation" className="scroll-mt-28">
            <FunRoutingSimulators />
          </section>
          <section id="posttest" className="scroll-mt-28">
            <PostTestSection />
          </section>
        </main>

        {/* Minimalist Footer */}
        <footer className="w-full py-16 border-t border-white/10 flex flex-col items-center justify-center gap-2 relative z-10 bg-black/40 backdrop-blur-sm">
          <RoutingLogo className="w-10 h-10 mb-2" />
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-zinc-500">
            Developed by
          </span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-white tracking-tight">
            Aryan Gorde
          </h3>
          <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-600 tracking-wider uppercase">
            Diverge.lab • Somaiya Vidyavihar // EXP-04
          </span>
        </footer>
      </div>
    </div>
  );
}

"use client";

import { TextRoll } from "@/components/ui/animated-menu";
import RoutingLogo from "@/components/brand/RoutingLogo";

export type SectionId = "hero" | "aim" | "theory" | "pretest" | "simulation" | "posttest";

export interface SideRailNavProps {
  activeSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  visible?: boolean;
}

const navItems: { id: SectionId; label: string; index: string }[] = [
  { id: "hero", label: "HERO", index: "[00]" },
  { id: "aim", label: "AIM", index: "[01]" },
  { id: "theory", label: "THEORY", index: "[02]" },
  { id: "pretest", label: "PRE-TEST", index: "[03]" },
  { id: "simulation", label: "SIMULATION", index: "[04]" },
  { id: "posttest", label: "POST-TEST", index: "[05]" },
];

export default function SideRailNav({ activeSection, onSelectSection, visible = true }: SideRailNavProps) {
  return (
    <aside
      className={`fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-6 p-4 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-xl shadow-2xl min-w-[210px] transition-all duration-500 ease-out ${
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 -translate-x-12 pointer-events-none"
      }`}
    >
      {/* Brand & Telemetry Badge */}
      <div className="px-2 pb-3 border-b border-white/10 flex items-center gap-3">
        <RoutingLogo className="w-7 h-7" />
        <div className="flex flex-col">
          <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-tight text-white leading-none">
            DIVERGE<span className="text-zinc-500 font-normal">.LAB</span>
          </span>
          <span className="font-['JetBrains_Mono'] text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
            EXP-04 // ROUTING
          </span>
        </div>
      </div>

      {/* Navigation List using Kinetic TextRoll */}
      <ul className="flex flex-col gap-2.5">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`group flex items-center justify-between cursor-pointer py-1.5 px-2.5 rounded-xl border transition-all duration-200 ${
                isActive
                  ? "bg-white/10 border-white/20 text-white font-semibold"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`font-['JetBrains_Mono'] text-[10px] transition-colors ${
                    isActive ? "text-white font-bold" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {item.index}
                </span>

                <TextRoll
                  className={`font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-tight transition-colors uppercase ${
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </TextRoll>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

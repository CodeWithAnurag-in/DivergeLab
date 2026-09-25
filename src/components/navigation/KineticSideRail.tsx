import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Target,
  BookOpen,
  CheckSquare,
  Award,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { TextRoll } from '@/components/ui/animated-menu';
import RoutingLogo from '@/components/brand/RoutingLogo';

export type SectionId = 'hero' | 'aim' | 'theory' | 'pretest' | 'simulation' | 'posttest';

export interface NavRailItem {
  id: SectionId;
  code: string;
  label: string;
  fullTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface KineticSideRailProps {
  activeSection?: SectionId;
  onSelectSection?: (id: SectionId) => void;
  // Backwards compatibility props
  activeNavId?: string;
  activeLabTab?: string;
  onSelectTab?: (tabId: any) => void;
  onScrollToHero?: () => void;
  onScrollToSimulation?: () => void;
}

export const KineticSideRail: React.FC<KineticSideRailProps> = ({
  activeSection,
  onSelectSection,
  activeNavId,
  onScrollToHero,
  onScrollToSimulation,
  onSelectTab,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const navItems: NavRailItem[] = [
    {
      id: 'hero',
      code: '00',
      label: 'HERO',
      fullTitle: 'Packet Hero 3D',
      icon: Layers,
    },
    {
      id: 'aim',
      code: '01',
      label: 'AIM',
      fullTitle: 'Aim & Objectives',
      icon: Target,
    },
    {
      id: 'theory',
      code: '02',
      label: 'THEORY',
      fullTitle: 'Comparative Theory',
      icon: BookOpen,
    },
    {
      id: 'pretest',
      code: '03',
      label: 'PRE-TEST',
      fullTitle: 'Prerequisite Readiness',
      icon: CheckSquare,
    },
    {
      id: 'simulation',
      code: '04',
      label: 'SIMULATION',
      fullTitle: 'Interactive Labs',
      icon: Cpu,
    },
    {
      id: 'posttest',
      code: '05',
      label: 'POST-TEST',
      fullTitle: 'Evaluation & Scorecard',
      icon: Award,
    },
  ];

  const handleItemClick = (item: NavRailItem) => {
    if (onSelectSection) {
      onSelectSection(item.id);
    } else if (item.id === 'hero' && onScrollToHero) {
      onScrollToHero();
    } else if (item.id === 'simulation' && onScrollToSimulation) {
      onScrollToSimulation();
    } else if (onSelectTab) {
      onSelectTab(item.id);
    } else {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentActive = activeSection || (activeNavId as SectionId) || 'hero';
  const showLabels = isExpanded || isHovered;

  return (
    <aside
      aria-label="Laboratory Side Navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 select-none font-['Geist']"
    >
      <div
        className={`relative flex flex-col rounded-2xl bg-[#090a0f] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all duration-300 ${
          showLabels ? 'w-48 sm:w-52 p-2.5' : 'w-14 sm:w-16 p-2 items-center'
        }`}
      >
        {/* Rail Top Header / Status LED */}
        <div
          className={`flex items-center gap-2 pb-2.5 mb-2 border-b border-white/10 w-full ${
            showLabels ? 'justify-between px-1.5' : 'justify-center'
          }`}
        >
          {showLabels ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <RoutingLogo className="w-6 h-6 shrink-0" />
              <div className="flex flex-col overflow-hidden text-left">
                <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xs tracking-tight text-white leading-none">
                  DIVERGE<span className="text-zinc-500 font-normal">.LAB</span>
                </span>
                <span className="font-['JetBrains_Mono'] text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  EXP-04 // ROUTING
                </span>
              </div>
            </div>
          ) : (
            <RoutingLogo className="w-6 h-6 shrink-0" />
          )}

          {/* Toggle Expand / Collapse Button (desktop only) */}
          {showLabels && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              title={isExpanded ? 'Collapse Menu' : 'Pin Menu Open'}
              className="hidden lg:flex p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Vertical List of Navigation Items with 21st.dev TextRoll */}
        <nav className="flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;

            return (
              <motion.button
                key={item.id}
                initial="initial"
                whileHover="hovered"
                onClick={() => handleItemClick(item)}
                title={item.fullTitle}
                className={`group relative flex items-center gap-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none text-left ${
                  showLabels ? 'px-2.5 py-2 w-full' : 'p-2 justify-center w-full'
                } ${
                  isActive
                    ? 'bg-white/10 border border-white/30 text-white font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {/* Active Indicator Pip */}
                {isActive && (
                  <motion.div
                    layoutId="kinetic-side-rail-pip"
                    className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-r shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}

                {/* Index Code Chip */}
                <span
                  className={`font-['JetBrains_Mono'] text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white text-black font-extrabold shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                      : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300'
                  }`}
                >
                  {item.code}
                </span>

                {/* Item Icon */}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />

                {/* Kinetic 21st.dev TextRoll Label */}
                {showLabels && (
                  <div className="flex-1 overflow-hidden">
                    <span className="font-['Plus_Jakarta_Sans'] text-xs tracking-tight uppercase block leading-none">
                      <TextRoll
                        className={
                          isActive
                            ? 'text-white font-extrabold'
                            : 'text-zinc-500 font-medium group-hover:text-zinc-300'
                        }
                      >
                        {item.label}
                      </TextRoll>
                    </span>
                  </div>
                )}

                {/* Active Right Status Pip */}
                {isActive && showLabels && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Rail Footer Telemetry */}
        <div
          className={`mt-2 pt-2 border-t border-white/10 w-full flex items-center ${
            showLabels ? 'justify-between px-1.5' : 'justify-center'
          } text-[9px] font-['JetBrains_Mono'] text-zinc-500`}
        >
          {showLabels ? (
            <>
              <span className="text-zinc-500 font-bold uppercase">KERNEL</span>
              <span className="text-zinc-300 font-bold">SPF•BF</span>
            </>
          ) : (
            <Compass className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </div>
      </div>
    </aside>
  );
};

export const SideRailNav = KineticSideRail;
export default KineticSideRail;

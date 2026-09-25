import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export const HudNavbar: React.FC = () => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'hero', label: '01 // DECONSTRUCTED PACKET' },
    { id: 'divergence', label: '02 // PARADIGM DIVERGENCE' },
    { id: 'link-state-engine', label: '03 // LINK-STATE SPF' },
    { id: 'distance-vector-engine', label: '04 // DISTANCE-VECTOR BF' },
    { id: 'pathology-lab', label: '05 // PATHOLOGY LAB' },
    { id: 'fib-telemetry-terminal', label: '06 // FIB TERMINAL' },
  ];

  const scrollTo = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-['JetBrains_Mono']">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <span className="font-bold text-white tracking-wider uppercase hidden sm:inline">
            ROUTING-PARADIGMS // HUD
          </span>
          <span className="font-bold text-white tracking-wider uppercase sm:hidden">
            ROUTING // HUD
          </span>
        </div>
        <span className="text-zinc-600 hidden md:inline">|</span>
        <span className="text-zinc-500 text-[10px] hidden md:inline">
          AS-65001 DETERMINISTIC TELEMETRY
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="px-2.5 py-1 rounded text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">
          <Activity className="w-3 h-3 text-white" />
          <span className="text-white font-bold">ACTIVE</span>
          <span className="text-zinc-600">|</span>
          <span>{timeString}</span>
        </div>
      </div>
    </nav>
  );
};

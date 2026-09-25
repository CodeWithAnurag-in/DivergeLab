import React from 'react';

interface HudHeaderProps {
  badgeNumber: string;
  badgeLabel: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  rightSlot?: React.ReactNode;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  badgeNumber,
  badgeLabel,
  title,
  subtitle,
  rightSlot,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[10px] tracking-wider uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="text-zinc-500">{badgeNumber}</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-300 font-bold">{badgeLabel}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest hidden sm:inline">
            RFC-STANDARDS-TELEMETRY
          </span>
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="font-['Geist'] text-zinc-400 text-sm sm:text-base mt-1 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && <div className="flex items-center gap-3">{rightSlot}</div>}
    </div>
  );
};

export default HudHeader;

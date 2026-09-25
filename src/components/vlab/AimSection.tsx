import React from 'react';
import { Target, Layers, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AimSectionProps {
  onProceed?: () => void;
}

export const AimSection: React.FC<AimSectionProps> = () => {
  return (
    <div className="space-y-6 font-['Geist'] animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 font-bold uppercase tracking-wider">
              VIRTUAL LAB MODULE // 01 • AIM &amp; SCOPE
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 font-['JetBrains_Mono'] text-[11px]">
            NET-EXP-04
          </span>
        </div>

        <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
          Aim &amp; Learning Objectives
        </h1>
        <p className="font-['Geist'] text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Compare global Link-State (Dijkstra SPF) against decentralized Distance-Vector (Bellman-Ford) routing. Analyze topology synchronization, algorithmic relaxation, and count-to-infinity loop mitigation.
        </p>
      </div>

      {/* 3-Column Compact Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-[#090a0f] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-2.5">
              <span>Framework</span>
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white mb-0.5">
              Bloom&apos;s Level 4
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-zinc-300 font-semibold mb-2">
              Analyze &amp; Differentiate
            </div>
            <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
              Deconstruct graph state sync, message horizons, and asynchronous table vectors.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
            AUDIT: TOPOLOGY GRAPHS
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#090a0f] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-2.5">
              <span>Core Paradigm</span>
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white mb-0.5">
              Global vs. Local
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-zinc-300 font-semibold mb-2">
              Dijkstra vs. Bellman-Ford
            </div>
            <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
              Centralized greedy tree search over LSDB vs. iterative rumor relaxation via peers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
            EQUATIONS: SPF &bull; DIST-VEC
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#090a0f] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-2.5">
              <span>Failure Modes</span>
              <AlertOctagon className="w-4 h-4 text-white" />
            </div>
            <div className="font-['Plus_Jakarta_Sans'] font-bold text-base text-white mb-0.5">
              Loop Dynamics
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-zinc-300 font-semibold mb-2">
              RFC 2453 Pathology
            </div>
            <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
              Count-to-infinity broken telephone loops, Split Horizon, and Poison Reverse guarantees.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
            FAILOVER: INFINITY CLAMP
          </div>
        </div>
      </div>

      {/* Measurable Outcomes as Crisp Bullet Chips */}
      <div className="bg-[#090a0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <span className="font-['JetBrains_Mono'] text-xs text-white font-bold uppercase tracking-wider">
            Measurable Competency Outcomes
          </span>
          <span className="text-[10px] font-['JetBrains_Mono'] text-zinc-500">
            POST-LAB BENCHMARK
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-white block mb-0.5">
                01. Scope Distinction
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Contrast full-topology LSP flooding (<code className="text-zinc-200 font-mono">LSDB</code>) with neighbor-only vector rumors (<code className="text-zinc-200 font-mono">RIP</code>).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-white block mb-0.5">
                02. Dijkstra Relaxation
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Execute greedy edge equation <code className="text-zinc-200 font-mono">D(v) = min(D(v), D(w) + c(w,v))</code> to settle shortest paths.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-white block mb-0.5">
                03. Loop Neutralization
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trace link-failure rumor recursion and evaluate Split Horizon and Poison Reverse countermeasures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AimSection;

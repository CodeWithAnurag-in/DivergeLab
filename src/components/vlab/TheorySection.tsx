import React, { useState } from 'react';
import { Network, Share2, Table, AlertTriangle, Layers } from 'lucide-react';

interface TheorySectionProps {
  onProceed?: () => void;
}

export const TheorySection: React.FC<TheorySectionProps> = ({ onProceed: _onProceed }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'link-state' | 'distance-vector' | 'matrix' | 'pathology'>('all');

  return (
    <div className="space-y-6 font-['Geist'] animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 font-bold uppercase tracking-wider">
                VIRTUAL LAB MODULE // 02 • CORE SPECIFICATIONS
              </span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Routing Theory &amp; Mechanics
            </h1>
            <p className="font-['Geist'] text-zinc-400 text-sm mt-1 max-w-xl">
              Mathematical invariants, message propagation horizons, and pathology countermeasures.
            </p>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Specs
            </button>

            <button
              onClick={() => setActiveSubTab('link-state')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'link-state'
                  ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Link-State
            </button>

            <button
              onClick={() => setActiveSubTab('distance-vector')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'distance-vector'
                  ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Distance-Vector
            </button>

            <button
              onClick={() => setActiveSubTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'matrix'
                  ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Matrix
            </button>

            <button
              onClick={() => setActiveSubTab('pathology')}
              className={`px-3 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'pathology'
                  ? 'bg-white text-black font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Pathology
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Card A: Link-State (OSPF / IS-IS) */}
      {(activeSubTab === 'all' || activeSubTab === 'link-state') && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 shadow-2xl">
            {/* Philosophy Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div>
                <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 uppercase font-bold tracking-wider">
                  01 // LINK-STATE SPECIFICATION (OSPF RFC 2328 / IS-IS)
                </span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white uppercase mt-1">
                  &ldquo;Tell everyone about my neighbors.&rdquo;
                </h2>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                CLASS: GREEDY SPF
              </span>
            </div>

            {/* 4-Stage Pipeline Chip */}
            <div className="mb-5">
              <span className="text-[10px] font-['JetBrains_Mono'] text-zinc-500 uppercase tracking-widest block mb-2">
                SYNCHRONIZATION &amp; SPF PIPELINE:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STAGE 01</span>
                  <span className="text-white font-bold">1. Hello Discovery</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Form 2-Way adjacency with direct peers.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STAGE 02</span>
                  <span className="text-white font-bold">2. Flood LSPs</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Reliably broadcast link states to area.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STAGE 03</span>
                  <span className="text-white font-bold">3. Sync LSDB Map</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Every node holds 100% identical topology.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STAGE 04</span>
                  <span className="text-white font-bold">4. Run Dijkstra SPF</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Compute loop-free tree locally.</p>
                </div>
              </div>
            </div>

            {/* Core Math Callout */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-5 font-['JetBrains_Mono'] text-zinc-200">
              <div className="flex items-center justify-between text-xs text-white font-bold mb-2">
                <span>DIJKSTRA GREEDY EDGE RELAXATION:</span>
                <span className="text-zinc-500 text-[10px]">TIME: O(|E| log |V|)</span>
              </div>
              <div className="text-base sm:text-lg text-white font-bold tracking-wide">
                D(v) = min( D(v), D(w) + c(w, v) )
              </div>
              <p className="font-['Geist'] text-zinc-400 text-xs mt-1.5 leading-relaxed">
                For each unsettled neighbor <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">v ∉ N&apos;</code> of the newly settled node <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">w</code>, relax distance using direct edge cost <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">c(w, v)</code>.
              </p>
            </div>

            {/* Telemetry Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Knowledge Scope</span>
                <span className="text-sm font-bold text-white">Global AS Graph</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Convergence</span>
                <span className="text-sm font-bold text-zinc-200">&lt; 50ms (Event-Driven)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Overhead</span>
                <span className="text-sm font-bold text-zinc-400">Higher RAM &amp; CPU</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Loop Safety</span>
                <span className="text-sm font-bold text-white">Inherently Loop-Free</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Card B: Distance-Vector (RIP / EIGRP) */}
      {(activeSubTab === 'all' || activeSubTab === 'distance-vector') && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 shadow-2xl">
            {/* Philosophy Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div>
                <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 uppercase font-bold tracking-wider">
                  02 // DISTANCE-VECTOR SPECIFICATION (RIP RFC 2453 / EIGRP)
                </span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white uppercase mt-1">
                  &ldquo;Tell my neighbors about everyone.&rdquo;
                </h2>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                CLASS: DYNAMIC PROGRAMMING
              </span>
            </div>

            {/* 3-Step Bellman-Ford Flow */}
            <div className="mb-5">
              <span className="text-[10px] font-['JetBrains_Mono'] text-zinc-500 uppercase tracking-widest block mb-2">
                BELLMAN-FORD ITERATIVE UPDATE FLOW:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STEP 01</span>
                  <span className="text-white font-bold">1. Receive Vector D_v(*)</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Accept periodic or triggered table rumors from neighbor v.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STEP 02</span>
                  <span className="text-white font-bold">2. Add Hop Cost c(x, v)</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Sum local link cost to neighbor&apos;s advertised distance.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono'] text-xs">
                  <span className="text-zinc-500 block text-[10px]">STEP 03</span>
                  <span className="text-white font-bold">3. Update if Lower</span>
                  <p className="font-['Geist'] text-zinc-400 text-[11px] mt-1">Overwrite routing table if candidate path metric improves.</p>
                </div>
              </div>
            </div>

            {/* Core Math Callout */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-5 font-['JetBrains_Mono'] text-zinc-200">
              <div className="flex items-center justify-between text-xs text-white font-bold mb-2">
                <span>BELLMAN-FORD EQUATION (DECENTRALIZED):</span>
                <span className="text-zinc-500 text-[10px]">HORIZON: DIRECT PEERS</span>
              </div>
              <div className="text-base sm:text-lg text-white font-bold tracking-wide">
                D_x(y) = min_{`{v ∈ Neighbors(x)}`} [ c(x, v) + D_v(y) ]
              </div>
              <p className="font-['Geist'] text-zinc-400 text-xs mt-1.5 leading-relaxed">
                Router <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">x</code> computes lowest path to destination <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">y</code> by minimizing direct hop cost plus neighbor reported distance.
              </p>
            </div>

            {/* Telemetry Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Knowledge Scope</span>
                <span className="text-sm font-bold text-zinc-200">Local Neighbors Only</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Convergence</span>
                <span className="text-sm font-bold text-zinc-400">Slow (Hop Cycles)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Overhead</span>
                <span className="text-sm font-bold text-white">Minimal RAM &amp; CPU</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-['JetBrains_Mono']">
                <span className="text-[10px] text-zinc-500 block uppercase">Vulnerability</span>
                <span className="text-sm font-bold text-zinc-400">Count-to-Infinity Risk</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Card C: Compact Comparison Matrix Table */}
      {(activeSubTab === 'all' || activeSubTab === 'matrix') && (
        <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <span className="font-['JetBrains_Mono'] text-xs text-white font-bold uppercase tracking-wider">
              03 // SPECIFICATION COMPARISON MATRIX
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500">
              RFC 2328 VS RFC 2453
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Dimension</th>
                  <th className="py-2.5 px-3 text-white font-bold">Link-State (Dijkstra)</th>
                  <th className="py-2.5 px-3 text-white font-bold">Distance-Vector (Bellman-Ford)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Topology View</td>
                  <td className="py-3 px-3 text-zinc-200">Global synchronized map (LSDB)</td>
                  <td className="py-3 px-3 text-zinc-400">Local routing table only</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Algorithm Type</td>
                  <td className="py-3 px-3 text-zinc-200">Centralized greedy tree search</td>
                  <td className="py-3 px-3 text-zinc-400">Distributed dynamic programming</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Message Scope</td>
                  <td className="py-3 px-3 text-zinc-200">Flooded network-wide</td>
                  <td className="py-3 px-3 text-zinc-400">Physical neighbors only</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Data Exchanged</td>
                  <td className="py-3 px-3 text-zinc-200">Direct link states &amp; costs</td>
                  <td className="py-3 px-3 text-zinc-400">Entire distance vector</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Convergence</td>
                  <td className="py-3 px-3 text-white font-bold">Fast (sub-50ms event-triggered)</td>
                  <td className="py-3 px-3 text-zinc-400">Slow (iterative rounds)</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Loop Resilience</td>
                  <td className="py-3 px-3 text-white font-bold">Immune to counting-to-infinity</td>
                  <td className="py-3 px-3 text-zinc-400">Requires Split Horizon / Poison Reverse</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-bold text-white">Protocols</td>
                  <td className="py-3 px-3 text-zinc-200">OSPF (RFC 2328), IS-IS</td>
                  <td className="py-3 px-3 text-zinc-400">RIPv2 (RFC 2453), EIGRP (DUAL)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Card D: Loop Pathology & Fixes (Count-to-Infinity) */}
      {(activeSubTab === 'all' || activeSubTab === 'pathology') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* The Pathology */}
            <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/10 shadow-2xl">
              <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                04 // THE PATHOLOGY
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-white text-base mb-1.5">
                Count-to-Infinity
              </h3>
              <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
                When links drop, neighbors exchange stale cached estimates. Routers increment costs mutually (<code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">2 → 3 → 4 … 16</code>) trapping packets in loops.
              </p>
            </div>

            {/* Split Horizon */}
            <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/10 shadow-2xl">
              <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                04.A // MITIGATION A
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-white text-base mb-1.5">
                Split Horizon
              </h3>
              <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
                <strong className="text-white">Rule:</strong> Never advertise a route back out the interface it was learned from. Prevents direct mutual rumor feedback loops between 2 adjacent neighbors.
              </p>
            </div>

            {/* Poison Reverse */}
            <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/10 shadow-2xl">
              <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                04.B // MITIGATION B
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-white text-base mb-1.5">
                Poison Reverse
              </h3>
              <p className="font-['Geist'] text-zinc-400 text-xs leading-relaxed">
                <strong className="text-white">Rule:</strong> Explicitly advertise metric <code className="text-zinc-200 bg-white/5 border border-white/10 px-1 rounded font-mono">∞ (16)</code> back to the route supplier. Breaks 2-node ping-pong cycles immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheorySection;

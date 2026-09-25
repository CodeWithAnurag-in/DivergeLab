import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HudHeader } from '../common/HudHeader';
import { Radio, Database, ArrowRightLeft, BookOpen } from 'lucide-react';

interface MatrixRow {
  dimension: string;
  category: string;
  linkState: string;
  distanceVector: string;
  winner: 'LS' | 'DV' | 'BALANCED';
  deepDive: {
    title: string;
    lsExplanation: string;
    dvExplanation: string;
    rfcRef: string;
  };
}

const COMPARISON_DATA: MatrixRow[] = [
  {
    dimension: 'Topology View',
    category: 'Knowledge Horizon',
    linkState: 'Global. Entire network graph known to all routers via synchronized LSDB.',
    distanceVector: 'Local. Only direct links and neighbor distance tables known ("Routing by rumor").',
    winner: 'LS',
    deepDive: {
      title: 'Global Synchronized LSDB vs. Direct Neighbor Horizons',
      lsExplanation: 'In OSPF and IS-IS, each router floods link-state advertisements (LSAs). Once flooding synchronizes, every node possesses an identical topological map G = (V, E) of the entire routing domain.',
      dvExplanation: 'In RIP and Bellman-Ford, a router x only maintains distances D_x(y) and the first hop v. It has zero visibility into the network graph topology beyond its immediate physical adjacencies.',
      rfcRef: 'RFC 2328 §3.1 (Global LSDB) vs RFC 2453 §2.1 (Vector Passing)'
    }
  },
  {
    dimension: 'Algorithm Type',
    category: 'Computation Class',
    linkState: 'Centralized Greedy. Dijkstra Shortest Path First (SPF) computed locally from root.',
    distanceVector: 'Distributed Dynamic Programming. Asynchronous, iterative Bellman-Ford relaxation.',
    winner: 'BALANCED',
    deepDive: {
      title: 'Centralized Greedy Priority-Queue vs. Distributed Dynamic Programming',
      lsExplanation: 'Dijkstra maintains a priority queue of unvisited nodes, greedily locking in the minimum-distance node at each step. Computational complexity is O(|E| log |V|) with binary heaps.',
      dvExplanation: 'Bellman-Ford iteratively computes D_x(y) = min_v { c(x,v) + D_v(y) } across local neighbor vectors. It solves shortest paths without graph traversal but depends on collaborative message exchanges.',
      rfcRef: 'Dijkstra (1959) vs Bellman (1958) / Ford-Fulkerson'
    }
  },
  {
    dimension: 'Message Scope',
    category: 'Flooding Boundary',
    linkState: 'Flooded network-wide to all routers across the autonomous system area.',
    distanceVector: 'Exchanged strictly with direct physical neighbors (never flooded network-wide).',
    winner: 'BALANCED',
    deepDive: {
      title: 'Global Autonomous System Flooding vs. Strictly Local Neighbor Exchanges',
      lsExplanation: 'Link-State Packets (LSPs) traverse all hops in Area 0 through reliable flooding with hop-by-hop Link-State Acknowledgments (LSAcks) and sequence numbers to eliminate duplicate storms.',
      dvExplanation: 'Distance vectors are sent exclusively over point-to-point or local broadcast interfaces to directly connected peers. They are never rebroadcast or flooded across multiple hops.',
      rfcRef: 'RFC 2328 §12 (Reliable Flooding) vs RFC 2453 §3.4.1 (Direct Output)'
    }
  },
  {
    dimension: 'Shared Content',
    category: 'Payload Anatomy',
    linkState: 'Status of direct links only (interface state, neighbor IP, metric, sequence #).',
    distanceVector: 'Entire distance table (complete list of destinations and advertised costs).',
    winner: 'LS',
    deepDive: {
      title: 'Compact Link-State Records vs. Monolithic Routing Tables',
      lsExplanation: 'A router only advertises its own immediate link costs. The packet payload is tiny (tens of bytes per link), minimizing continuous bandwidth draw during stable operations.',
      dvExplanation: 'Each distance vector message contains the sender\'s entire routing table. In large networks, passing complete vectors every 30 seconds can consume substantial link throughput.',
      rfcRef: 'RFC 2328 §4.3 (LSA Payloads) vs RFC 2453 §3.2 (RIP Packet Format)'
    }
  },
  {
    dimension: 'Convergence Speed',
    category: 'Speed to Stability',
    linkState: 'Fast. Event-triggered reliable flooding achieves sub-second convergence (<50ms).',
    distanceVector: 'Slow. Limited by hop-by-hop message passing and timer holddowns (seconds to minutes).',
    winner: 'LS',
    deepDive: {
      title: 'Sub-second SPF Tree Generation vs. Hop-by-Hop Iteration Propagation',
      lsExplanation: 'When a link transitions, an LSP is flooded at line-rate. All routers receive the alert almost simultaneously and execute local Dijkstra within milliseconds.',
      dvExplanation: 'Distance information propagates at the speed of update cycles (one hop per 30s timer in naive RIP). In a diameter-6 network, propagation can take several minutes to stabilize.',
      rfcRef: 'RFC 5340 (OSPFv3 Convergence) vs RFC 2453 §3.8 (Timer Management)'
    }
  },
  {
    dimension: 'Loop Resilience',
    category: 'Failure Stability',
    linkState: 'High. Immune to count-to-infinity; only transient micro-loops during LSP flood.',
    distanceVector: 'Low. Highly susceptible to persistent loops; requires Split Horizon & Poison Reverse.',
    winner: 'LS',
    deepDive: {
      title: 'Transient Micro-Loops vs. Count-to-Infinity Pathology',
      lsExplanation: 'Because every router runs Dijkstra on an identical graph database, persistent routing loops are mathematically impossible. Micro-loops only last during the millisecond flooding window.',
      dvExplanation: 'Routing by rumor allows routers to accept obsolete routes that pass back through themselves. Without Split Horizon, Poison Reverse, and Hop Limits, metrics bounce indefinitely.',
      rfcRef: 'RFC 2453 §2.2 (Loop Prevention) vs RFC 2328 §16 (SPF Tree Loop Freedom)'
    }
  },
  {
    dimension: 'Resource Demand',
    category: 'Hardware Overhead',
    linkState: 'High CPU (SPF tree generation) & Memory (storing entire synchronized LSDB).',
    distanceVector: 'Low CPU (simple additions & scalar comparisons) & Minimal memory (1D vector).',
    winner: 'DV',
    deepDive: {
      title: 'Heavy Graph Processing vs. Lightweight Vector Arithmetic',
      lsExplanation: 'Large enterprise networks with thousands of LSAs require dedicated routing engine CPUs and megabytes of control-plane memory to maintain the LSDB tree.',
      dvExplanation: 'Distance-vector routers require only O(|Destinations|) memory and basic integer arithmetic, making them suitable for low-cost embedded IoT microcontrollers.',
      rfcRef: 'IETF Benchmarking Methodology WG (BWMG)'
    }
  },
  {
    dimension: 'Industry Standards',
    category: 'Protocol Deployments',
    linkState: 'OSPF (RFC 2328, RFC 5340), IS-IS (ISO/IEC 10589).',
    distanceVector: 'RIPv1/RIPv2 (RFC 2453), Cisco EIGRP (DUAL hybrid), BGP-4 (Path-Vector).',
    winner: 'BALANCED',
    deepDive: {
      title: 'Enterprise Interior Gateway Protocols vs. Hybrid & Edge Vectors',
      lsExplanation: 'OSPFv2 and IS-IS dominate modern data centers, cloud infrastructure, and large enterprise cores due to deterministic convergence and sub-area hierarchy.',
      dvExplanation: 'RIPv2 is deployed in small legacy or isolated edge subnets. Cisco EIGRP uses DUAL (Diffusing Update Algorithm) to provide loop-free distance-vector convergence with sub-second failover.',
      rfcRef: 'RFC 2328, RFC 2453, RFC 7868'
    }
  }
];

export const ParadigmDivergence: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<MatrixRow | null>(null);
  const [activeSim, setActiveSim] = useState<'NONE' | 'LS_FLOOD' | 'DV_GOSSIP'>('NONE');
  const [simPulse, setSimPulse] = useState(0);

  const triggerSimulation = (type: 'LS_FLOOD' | 'DV_GOSSIP') => {
    setActiveSim(type);
    setSimPulse(p => p + 1);
    setTimeout(() => {
      setActiveSim('NONE');
    }, 2800);
  };

  return (
    <section className="relative w-full bg-black py-16 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <HudHeader
          badgeNumber="SECTION 02"
          badgeLabel="PARADIGM DIVERGENCE"
          title="PARADIGM DIVERGENCE // GLOBAL VS LOCAL KNOWLEDGE"
          subtitle="The foundational split in distributed routing theory: Should a router construct a complete global cartographic model of the autonomous system, or merely accept direction-and-distance signposts from immediate peers?"
          accentColor="white"
          rightSlot={
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs font-['JetBrains_Mono']">
              <span className="text-zinc-500">PHILOSOPHY:</span>
              <span className="text-white font-bold">GLOBAL MAP</span>
              <span className="text-zinc-600">vs</span>
              <span className="text-zinc-400 font-bold">LOCAL SIGNPOST</span>
            </div>
          }
        />

        {/* Synchronized Split-Screen Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* Left Console: Link-State */}
          <div className="relative bg-zinc-950/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-white tracking-wider uppercase">
                    LINK-STATE (GLOBAL KNOWLEDGE) // OSPF & IS-IS
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-['JetBrains_Mono'] text-[10px]">
                  RFC 2328
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase leading-snug">
                  &ldquo;Tell everyone about my neighbors.&rdquo;
                </p>
                <p className="font-['Geist'] text-zinc-400 text-xs sm:text-sm mt-1">
                  Global topology awareness: Reliable Link-State Packet (LSP) flooding across the entire AS, 100% identical LSDB synchronization, and independent local execution of Dijkstra&apos;s algorithm.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-zinc-500 mb-3 uppercase">
                  <span>Cartographic Model: Complete Graph Satellite</span>
                  <Database className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                <div className="relative h-32 w-full flex items-center justify-center bg-zinc-900/40 rounded-lg border border-white/5 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 130">
                    <circle cx="60" cy="65" r="16" fill="#09090b" stroke="#ffffff" strokeWidth="2" />
                    <text x="60" y="69" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">A</text>

                    <circle cx="170" cy="30" r="14" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="170" y="34" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">B</text>

                    <circle cx="170" cy="100" r="14" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="170" y="104" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">D</text>

                    <circle cx="280" cy="30" r="14" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="280" y="34" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">C</text>

                    <circle cx="280" cy="100" r="14" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="280" y="104" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">E</text>

                    <circle cx="360" cy="65" r="14" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="360" y="69" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">F</text>

                    <line x1="76" y1="65" x2="156" y2="30" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="76" y1="65" x2="156" y2="100" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="184" y1="30" x2="266" y2="30" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="184" y1="100" x2="266" y2="100" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="294" y1="30" x2="346" y2="65" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="294" y1="100" x2="346" y2="65" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />

                    {activeSim === 'LS_FLOOD' && (
                      <g key={simPulse}>
                        <motion.circle
                          cx="60" cy="65" r="12"
                          fill="none" stroke="#ffffff" strokeWidth="2"
                          initial={{ r: 12, opacity: 1 }}
                          animate={{ r: 160, opacity: 0 }}
                          transition={{ duration: 1.6, ease: "easeOut" }}
                        />
                        <motion.circle
                          cx="60" cy="65" r="8"
                          fill="#ffffff"
                          initial={{ cx: 60, cy: 65, opacity: 1 }}
                          animate={{ cx: 170, cy: 30 }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.circle
                          cx="60" cy="65" r="8"
                          fill="#ffffff"
                          initial={{ cx: 60, cy: 65, opacity: 1 }}
                          animate={{ cx: 170, cy: 100 }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.circle
                          cx="170" cy="30" r="8"
                          fill="#ffffff"
                          initial={{ cx: 170, cy: 30, opacity: 0 }}
                          animate={{ cx: 280, cy: 30, opacity: [0, 1, 1] }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                        />
                        <motion.circle
                          cx="170" cy="100" r="8"
                          fill="#ffffff"
                          initial={{ cx: 170, cy: 100, opacity: 0 }}
                          animate={{ cx: 280, cy: 100, opacity: [0, 1, 1] }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                        />
                        <motion.circle
                          cx="280" cy="30" r="8"
                          fill="#ffffff"
                          initial={{ cx: 280, cy: 30, opacity: 0 }}
                          animate={{ cx: 360, cy: 65, opacity: [0, 1, 1] }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                        />
                      </g>
                    )}
                  </svg>
                  
                  <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[9px] font-['JetBrains_Mono'] text-zinc-400">
                    <span>LSP: [Node A, seq# 0x80000003, age 24s]</span>
                    <span className="text-white font-mono">FLOOD RELIABLY TO ALL AS NODES</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-['Geist']">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase">LSDB Map</span>
                    <span className="text-zinc-200">100% Identical in all nodes</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase">Calculation</span>
                    <span className="text-white font-bold">Dijkstra Shortest Path First</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-['JetBrains_Mono'] text-zinc-500">STATE: SYNCHRONIZED</span>
              <button
                onClick={() => triggerSimulation('LS_FLOOD')}
                disabled={activeSim !== 'NONE'}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5 text-white" />
                Flood LSP From Node A
              </button>
            </div>
          </div>

          {/* Right Console: Distance-Vector */}
          <div className="relative bg-zinc-950/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-400" />
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-white tracking-wider uppercase">
                    DISTANCE-VECTOR (DECENTRALIZED) // RIPv2 & EIGRP
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-['JetBrains_Mono'] text-[10px]">
                  RFC 2453
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase leading-snug">
                  &ldquo;Tell my neighbors about everyone.&rdquo;
                </p>
                <p className="font-['Geist'] text-zinc-400 text-xs sm:text-sm mt-1">
                  Decentralized hop-by-hop tables: Dynamic programming Bellman-Ford equation and routing by rumor. Routers possess zero map beyond immediate neighbor interfaces.
                </p>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-zinc-500 mb-3 uppercase">
                  <span>Directional Signpost: Neighbor Vector Passing</span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                <div className="relative h-32 w-full flex items-center justify-center bg-zinc-900/40 rounded-lg border border-white/5 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 130">
                    <circle cx="60" cy="65" r="16" fill="#09090b" stroke="#ffffff" strokeWidth="2" />
                    <text x="60" y="69" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">A</text>

                    <circle cx="200" cy="65" r="16" fill="#09090b" stroke="#ffffff" strokeWidth="2" />
                    <text x="200" y="69" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">B</text>

                    <circle cx="340" cy="65" r="16" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
                    <text x="340" y="69" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontFamily="JetBrains Mono">C</text>

                    <line x1="76" y1="65" x2="184" y2="65" stroke="#ffffff" strokeWidth="1.5" />
                    <line x1="216" y1="65" x2="324" y2="65" stroke="#3f3f46" strokeWidth="1" strokeDasharray="2 2" />

                    <text x="130" y="55" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">c=1</text>
                    <text x="270" y="55" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="JetBrains Mono">c=1</text>

                    {activeSim === 'DV_GOSSIP' && (
                      <g key={simPulse}>
                        <motion.rect
                          x="76" y="58" width="28" height="14" rx="3"
                          fill="#ffffff"
                          initial={{ x: 76, opacity: 1 }}
                          animate={{ x: 156 }}
                          transition={{ duration: 1.0, ease: "easeInOut" }}
                        />
                        <motion.rect
                          x="184" y="58" width="28" height="14" rx="3"
                          fill="#ffffff"
                          initial={{ x: 184, opacity: 0 }}
                          animate={{ x: 296, opacity: [0, 1, 1] }}
                          transition={{ duration: 1.0, delay: 1.0, ease: "easeInOut" }}
                        />
                      </g>
                    )}
                  </svg>

                  <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[9px] font-['JetBrains_Mono'] text-zinc-400">
                    <span>VECTOR: [Dest C: cost 2, via B]</span>
                    <span className="text-white font-mono">NEIGHBOR-ONLY HOPS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-['Geist']">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase">Knowledge Scope</span>
                    <span className="text-zinc-200">Zero global map; purely local</span>
                  </div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                    <span className="text-zinc-500 font-mono text-[10px] block uppercase">Calculation</span>
                    <span className="text-zinc-300">Bellman-Ford Dynamic Prog.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-['JetBrains_Mono'] text-zinc-500">STATE: HOP-BY-HOP</span>
              <button
                onClick={() => triggerSimulation('DV_GOSSIP')}
                disabled={activeSim !== 'NONE'}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-['JetBrains_Mono'] font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5 text-white" />
                Send Neighbor Vector Rumor
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Feature Matrix Table */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white uppercase tracking-tight">
                Architectural Matrix // Head-to-Head Comparison
              </h3>
              <p className="font-['Geist'] text-zinc-400 text-xs sm:text-sm mt-0.5">
                Hover or click any dimension to inspect formal mathematical characteristics, complexity orders, and protocol caveats.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" /> LS Advantage
              <span className="w-2 h-2 rounded-full bg-zinc-400 ml-2" /> DV Advantage
              <span className="w-2 h-2 rounded-full bg-zinc-600 ml-2" /> Balanced
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 font-['JetBrains_Mono'] text-[11px] text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-white">Link-State (Global Knowledge)</th>
                  <th className="py-3 px-4 text-zinc-300">Distance-Vector (Decentralized Knowledge)</th>
                  <th className="py-3 px-4 text-right">Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-['Geist'] text-xs">
                {COMPARISON_DATA.map((row, idx) => {
                  const isSelected = selectedRow?.dimension === row.dimension;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRow(isSelected ? null : row)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-4 px-4 font-['Plus_Jakarta_Sans'] font-bold text-white tracking-wide">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.winner === 'LS' ? 'bg-white' : row.winner === 'DV' ? 'bg-zinc-400' : 'bg-zinc-600'
                          }`} />
                          {row.dimension}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-['JetBrains_Mono'] text-[11px] text-zinc-400">
                        {row.category}
                      </td>
                      <td className="py-4 px-4 text-zinc-300 max-w-xs leading-relaxed">
                        {row.linkState}
                      </td>
                      <td className="py-4 px-4 text-zinc-300 max-w-xs leading-relaxed">
                        {row.distanceVector}
                      </td>
                      <td className="py-4 px-4 text-right font-['JetBrains_Mono'] text-[11px]">
                        <span className={`px-2 py-1 rounded border inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-white/20 border-white text-white font-bold'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}>
                          <BookOpen className="w-3 h-3" />
                          {isSelected ? 'Close' : 'Inspect'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Deep-Dive Inspection Drawer */}
          <AnimatePresence>
            {selectedRow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6 pt-6 border-t border-white/10"
              >
                <div className="bg-zinc-900/60 border border-white/15 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 uppercase">
                        DEEP DIVE SPECIFICATION //
                      </span>
                      <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-white text-base">
                        {selectedRow.deepDive.title}
                      </h4>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 bg-black/40 px-2.5 py-1 rounded border border-white/10">
                      Standard: {selectedRow.deepDive.rfcRef}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-white font-bold uppercase tracking-wider block mb-2">
                        Link-State Architecture Mechanics
                      </span>
                      <p className="font-['Geist'] text-zinc-300 text-xs leading-relaxed">
                        {selectedRow.deepDive.lsExplanation}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10">
                      <span className="font-['JetBrains_Mono'] text-[10px] text-white font-bold uppercase tracking-wider block mb-2">
                        Distance-Vector Architecture Mechanics
                      </span>
                      <p className="font-['Geist'] text-zinc-300 text-xs leading-relaxed">
                        {selectedRow.deepDive.dvExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

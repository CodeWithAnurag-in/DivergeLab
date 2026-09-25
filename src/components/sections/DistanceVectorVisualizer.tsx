import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { HudHeader } from '../common/HudHeader';
import {
  type NodeId,
  type GraphNode,
  type GraphEdge,
} from '../../types/routing';
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  computeDistanceVectorCycles,
  getActiveAdjacency,
} from '../../utils/graphAlgorithms';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Network,
  Calculator,
  CheckCircle2,
  Radio,
  Share2
} from 'lucide-react';

export const DistanceVectorVisualizer: React.FC = () => {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [inspectRouter, setInspectRouter] = useState<NodeId>('A');
  const [inspectDest, setInspectDest] = useState<NodeId>('C');
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'SINGLE_ROUTER' | 'GLOBAL_MATRIX'>('SINGLE_ROUTER');

  // Compute all DV cycles
  const cycles = useMemo(() => {
    return computeDistanceVectorCycles(nodes, edges);
  }, [nodes, edges]);

  // Clamp current cycle
  useEffect(() => {
    if (currentCycleIndex >= cycles.length) {
      setCurrentCycleIndex(cycles.length - 1);
    }
  }, [cycles, currentCycleIndex]);

  const currentStep = cycles[currentCycleIndex] || cycles[0];
  const adj = useMemo(() => getActiveAdjacency(nodes, edges), [nodes, edges]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentCycleIndex((prev) => {
        if (prev < cycles.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isPlaying, cycles.length]);

  // Toggle severed edge
  const toggleSeverEdge = (edgeId: string) => {
    setEdges(prev =>
      prev.map(e => e.id === edgeId ? { ...e, isSevered: !e.isSevered } : e)
    );
    setCurrentCycleIndex(0);
    setIsPlaying(false);
  };

  // Bellman-Ford formula evaluation breakdown for (inspectRouter -> inspectDest)
  const bellmanFordBreakdown = useMemo(() => {
    const x = inspectRouter;
    const y = inspectDest;
    const neighbors = Object.keys(adj[x]) as NodeId[];

    if (x === y) {
      return {
        formula: `D_${x}(${y}) = 0 (Self)`,
        candidates: [],
        winner: x,
        minCost: 0
      };
    }

    const candidates = neighbors.map(v => {
      const linkCost = adj[x][v];
      const prevTable = currentCycleIndex > 0 ? cycles[currentCycleIndex - 1].tables : currentStep.tables;
      const neighborDist = prevTable[v]?.[y]?.cost ?? Infinity;
      const total = linkCost + neighborDist;
      return {
        neighbor: v,
        linkCost,
        neighborDist,
        total
      };
    });

    let bestCost = Infinity;
    let bestNeighbor: NodeId | '-' = '-';
    candidates.forEach(c => {
      if (c.total < bestCost) {
        bestCost = c.total;
        bestNeighbor = c.neighbor;
      }
    });

    return {
      formula: `D_${x}(${y}) = min_{v ∈ N(${x})} { c(${x}, v) + D_v(${y}) }`,
      candidates,
      winner: bestNeighbor,
      minCost: bestCost
    };
  }, [inspectRouter, inspectDest, adj, currentCycleIndex, cycles, currentStep.tables]);

  return (
    <section id="distance-vector-engine" className="relative w-full bg-black py-16 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <HudHeader
          badgeNumber="SECTION 04"
          badgeLabel="DISTANCE-VECTOR ENGINE"
          title="THE DISTANCE-VECTOR ENGINE & BELLMAN-FORD VISUALIZER"
          subtitle="Inspect decentralized, asynchronous vector propagation. No router possesses a global topology map—each computes shortest paths purely by rumor from direct physical neighbors."
          accentColor="white"
          rightSlot={
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-['JetBrains_Mono'] border flex items-center gap-1.5 ${
                currentStep.converged
                  ? 'bg-white/10 border-white/40 text-white'
                  : 'bg-white/5 border-white/20 text-zinc-300'
              }`}>
                {currentStep.converged ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    CONVERGED AT CYCLE {currentStep.cycle}
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ITERATING // CYCLE {currentStep.cycle}
                  </>
                )}
              </span>
            </div>
          }
        />

        {/* Stepper Control Strip */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Cycle Counter */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              CYCLE t = {currentStep.cycle}
            </div>
            <p className="text-zinc-400 font-['Geist'] text-xs hidden sm:block max-w-sm truncate">
              {currentStep.explanation}
            </p>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentCycleIndex(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
              title="Reset to Cycle 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-white text-black font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_12px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause Iterations' : 'Auto-Run to Convergence'}
            </button>

            <button
              onClick={() => {
                if (currentCycleIndex < cycles.length - 1) {
                  setCurrentCycleIndex(prev => prev + 1);
                }
              }}
              disabled={currentCycleIndex >= cycles.length - 1}
              className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-white font-['JetBrains_Mono'] text-xs font-medium flex items-center gap-1.5 disabled:opacity-30 transition-colors"
            >
              Step Cycle (t → t+1)
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('SINGLE_ROUTER')}
              className={`px-3 py-1 rounded-lg text-xs font-['JetBrains_Mono'] transition-all ${
                viewMode === 'SINGLE_ROUTER'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Router View
            </button>
            <button
              onClick={() => setViewMode('GLOBAL_MATRIX')}
              className={`px-3 py-1 rounded-lg text-xs font-['JetBrains_Mono'] transition-all ${
                viewMode === 'GLOBAL_MATRIX'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Global Matrix
            </button>
          </div>
        </div>

        {/* Main Grid: Interactive Mesh Rumor Animation + Decentralized Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Rumor Passing SVG Animation Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-950/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 pointer-events-none hud-grid-pattern opacity-30" />

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-white" />
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white uppercase tracking-wider">
                  RUMOR-PASSING PACKET EXCHANGES // CYCLE {currentStep.cycle}
                </span>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-500">
                Vector packets slide strictly along direct links
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="relative z-10 w-full h-[380px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 700 420">
                <defs>
                  <filter id="glow-white" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Edges */}
                {edges.map(edge => {
                  const sNode = nodes.find(n => n.id === edge.source)!;
                  const tNode = nodes.find(n => n.id === edge.target)!;
                  const isSevered = edge.isSevered;
                  const midX = (sNode.x + tNode.x) / 2;
                  const midY = (sNode.y + tNode.y) / 2;

                  return (
                    <g key={edge.id} className="cursor-pointer" onClick={() => toggleSeverEdge(edge.id)}>
                      <line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke={isSevered ? '#52525b' : '#3f3f46'}
                        strokeWidth={1.5}
                        strokeDasharray={isSevered ? '4 4' : undefined}
                      />
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-20"
                          y="-9"
                          width="40"
                          height="18"
                          rx="4"
                          fill={isSevered ? '#18181b' : '#09090b'}
                          stroke={isSevered ? '#52525b' : '#27272a'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isSevered ? '#71717a' : '#a1a1aa'}
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                        >
                          {isSevered ? 'CUT' : `c=${edge.cost}`}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Animated Vector Packets passing along active links */}
                {currentCycleIndex > 0 && currentStep.exchanges.map((ex, i) => {
                  const sNode = nodes.find(n => n.id === ex.from);
                  const tNode = nodes.find(n => n.id === ex.to);
                  if (!sNode || !tNode) return null;

                  return (
                    <g key={`${ex.from}-${ex.to}-${currentCycleIndex}-${i}`}>
                      <motion.circle
                        r="5"
                        fill="#ffffff"
                        filter="url(#glow-white)"
                        initial={{
                          cx: sNode.x,
                          cy: sNode.y,
                          opacity: 0.9
                        }}
                        animate={{
                          cx: tNode.x,
                          cy: tNode.y,
                          opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: (i % 4) * 0.25,
                          ease: "easeInOut"
                        }}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const isInspected = inspectRouter === node.id;
                  const isDest = inspectDest === node.id;
                  const costToDest = currentStep.tables[node.id]?.[inspectDest]?.cost;

                  let strokeColor = '#3f3f46';
                  let textColor = '#e4e4e7';
                  let filter = undefined;

                  if (isInspected) {
                    strokeColor = '#ffffff';
                    textColor = '#ffffff';
                    filter = 'url(#glow-white)';
                  } else if (isDest) {
                    strokeColor = '#a1a1aa';
                    textColor = '#d4d4d8';
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setInspectRouter(node.id)}
                    >
                      <circle
                        r="20"
                        fill="#09090b"
                        stroke={strokeColor}
                        strokeWidth={isInspected ? 2.5 : 1.5}
                        filter={filter}
                        className="transition-colors duration-300"
                      />

                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill={textColor}
                        fontSize="14"
                        fontFamily="Plus Jakarta Sans"
                        fontWeight="bold"
                      >
                        {node.id}
                      </text>

                      {/* Distance metric to inspectDest badge */}
                      <g transform="translate(0, -28)">
                        <rect
                          x="-26"
                          y="-9"
                          width="52"
                          height="18"
                          rx="4"
                          fill="#09090b"
                          stroke={isInspected ? '#ffffff' : isDest ? '#a1a1aa' : '#27272a'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={costToDest === Infinity ? '#71717a' : '#ffffff'}
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {`D→${inspectDest}=${costToDest === Infinity ? '∞' : costToDest}`}
                        </text>
                      </g>

                      {/* Tag below node */}
                      <text
                        x="0"
                        y="34"
                        textAnchor="middle"
                        fill="#71717a"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                      >
                        {node.ip}
                      </text>

                      {isInspected && (
                        <g transform="translate(0, 44)">
                          <rect
                            x="-22"
                            y="-6"
                            width="44"
                            height="12"
                            rx="3"
                            fill="#ffffff"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill="#000000"
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            LOCAL VIEW
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-['JetBrains_Mono']">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="text-zinc-300">Selected Local Node (x)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  <span className="text-zinc-300">Target Destination (y)</span>
                </div>
              </div>

              <div className="text-zinc-500">
                {currentStep.activeUpdates.length > 0 ? (
                  <span className="text-white font-mono">
                    ⚡ {currentStep.activeUpdates.length} Vector Updates this Cycle
                  </span>
                ) : (
                  <span className="text-zinc-400 font-mono">0 Updates • Stable Equilibrium</span>
                )}
              </div>
            </div>
          </div>

          {/* Decentralized Tables & Bellman-Ford Calculator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* View Mode 1: Single Router's Decentralized Table */}
            {viewMode === 'SINGLE_ROUTER' ? (
              <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-['JetBrains_Mono'] text-xs text-zinc-500 uppercase">
                    LOCAL DISTANCE VECTOR // ROUTER {inspectRouter}
                  </span>
                  
                  {/* Router Selector */}
                  <div className="flex gap-1">
                    {(['A', 'B', 'C', 'D', 'E', 'F'] as NodeId[]).map(nid => (
                      <button
                        key={nid}
                        onClick={() => setInspectRouter(nid)}
                        className={`w-6 h-6 rounded font-['JetBrains_Mono'] text-[11px] font-bold transition-all ${
                          inspectRouter === nid
                            ? 'bg-white text-black shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                            : 'bg-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {nid}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table of Router x's perspective */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 text-[10px] uppercase">
                        <th className="pb-2">Dest (y)</th>
                        <th className="pb-2">Cost D_{inspectRouter}(y)</th>
                        <th className="pb-2">Next-Hop (v)</th>
                        <th className="pb-2 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {nodes.map(n => {
                        const entry = currentStep.tables[inspectRouter]?.[n.id];
                        const cost = entry?.cost ?? Infinity;
                        const nextHop = entry?.nextHop ?? '-';
                        const isTarget = inspectDest === n.id;

                        return (
                          <tr
                            key={n.id}
                            onClick={() => setInspectDest(n.id)}
                            className={`cursor-pointer transition-colors ${
                              isTarget ? 'bg-white/10' : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <td className="py-2 font-bold text-white flex items-center gap-1.5">
                              {n.id}
                              {isTarget && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                              )}
                            </td>
                            <td className="py-2 text-white font-mono">
                              {cost === Infinity ? '∞' : cost}
                            </td>
                            <td className="py-2 text-zinc-300">
                              {n.id === inspectRouter ? 'SELF' : nextHop}
                            </td>
                            <td className="py-2 text-right">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isTarget ? 'bg-white text-black font-bold' : 'text-zinc-600'
                              }`}>
                                {isTarget ? 'Active' : 'Select'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 text-[11px] font-['Geist'] text-zinc-400">
                  <span className="font-bold text-white">Private Knowledge Only:</span> Router {inspectRouter} has no idea what the topology looks like behind its next-hop neighbors. It simply forwards to whichever neighbor advertised the lowest metric.
                </div>
              </div>
            ) : (
              /* View Mode 2: Global 6x6 Distance Matrix */
              <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 text-xs font-['JetBrains_Mono'] text-zinc-500 uppercase">
                  <span>GLOBAL DISTANCE MATRIX D(X, Y) // CYCLE {currentStep.cycle}</span>
                  <Network className="w-3.5 h-3.5 text-white" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center font-['JetBrains_Mono'] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 text-[10px]">
                        <th className="pb-2 text-left">From \ To</th>
                        {nodes.map(n => (
                          <th key={n.id} className="pb-2 font-bold text-white">{n.id}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {nodes.map(rowNode => (
                        <tr key={rowNode.id}>
                          <td className="py-2 text-left font-bold text-white">{rowNode.id}</td>
                          {nodes.map(colNode => {
                            const cost = currentStep.tables[rowNode.id]?.[colNode.id]?.cost ?? Infinity;
                            const isSelf = rowNode.id === colNode.id;
                            return (
                              <td
                                key={colNode.id}
                                className={`py-2 ${
                                  isSelf
                                    ? 'text-zinc-600 font-normal'
                                    : cost === Infinity
                                    ? 'text-zinc-600'
                                    : 'text-white font-bold font-mono'
                                }`}
                              >
                                {cost === Infinity ? '∞' : cost}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Real-time Bellman-Ford Relaxation Calculator */}
            <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2 text-xs font-['JetBrains_Mono'] text-zinc-500 uppercase tracking-wider">
                  <span>BELLMAN-FORD RELAXATION CALCULATOR</span>
                  <Calculator className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                <div className="p-3 rounded-lg bg-black border border-white/15 font-['JetBrains_Mono'] text-xs text-white mb-4">
                  <div className="text-white font-bold mb-1 text-[11px]">
                    D_{inspectRouter}({inspectDest}) = min_{`{v ∈ Neighbors}`} [ c({inspectRouter}, v) + D_v({inspectDest}) ]
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Evaluating paths from Node {inspectRouter} to Destination {inspectDest}:
                  </div>
                </div>

                {/* Candidate Neighbors Evaluation */}
                <div className="space-y-2 mb-4 font-['JetBrains_Mono'] text-xs">
                  {bellmanFordBreakdown.candidates.length > 0 ? (
                    bellmanFordBreakdown.candidates.map(c => {
                      const isWinner = c.neighbor === bellmanFordBreakdown.winner;
                      return (
                        <div
                          key={c.neighbor}
                          className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                            isWinner
                              ? 'bg-white/10 border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.08)]'
                              : 'bg-zinc-900/40 border-white/5 text-zinc-400'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-white">Via Neighbor {c.neighbor}:</span>{' '}
                            <span className="text-zinc-400">
                              c({inspectRouter},{c.neighbor}) [{c.linkCost}] + D_{c.neighbor}({inspectDest}) [{c.neighborDist === Infinity ? '∞' : c.neighborDist}]
                            </span>
                          </div>
                          <div className="font-bold">
                            = {c.total === Infinity ? '∞' : c.total}
                            {isWinner && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white text-black font-extrabold uppercase">
                                MIN
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs font-['JetBrains_Mono'] text-zinc-500 p-2">
                      Source equals destination (cost is 0).
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-['JetBrains_Mono']">
                <span className="text-zinc-500">Selected Path:</span>
                <span className="text-white font-bold font-mono">
                  Next-Hop: {bellmanFordBreakdown.winner} (Total Cost: {bellmanFordBreakdown.minCost === Infinity ? '∞' : bellmanFordBreakdown.minCost})
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

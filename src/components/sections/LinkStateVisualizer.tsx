import React, { useState, useEffect, useMemo } from 'react';
import { HudHeader } from '../common/HudHeader';
import {
  type NodeId,
  type GraphNode,
  type GraphEdge,
} from '../../types/routing';
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  computeDijkstraSteps,
  generateLSDB,
} from '../../utils/graphAlgorithms';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Scissors,
  CheckCircle2,
  Database,
  Calculator,
  GitCommit,
  Network
} from 'lucide-react';

export const LinkStateVisualizer: React.FC = () => {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [sourceNode, setSourceNode] = useState<NodeId>('A');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playSpeed = 1200; // 1.2s as specified in requirements

  // Generate true algorithmic execution steps
  const steps = useMemo(() => {
    return computeDijkstraSteps(nodes, edges, sourceNode);
  }, [nodes, edges, sourceNode]);

  // Clamp current step index
  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(steps.length - 1);
    }
  }, [steps, currentStepIndex]);

  // Current step state
  const step = steps[currentStepIndex] || steps[0];

  // Auto-play timer (1.2s per step)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length, playSpeed]);

  // Toggle severed state of an edge
  const toggleSeverEdge = (edgeId: string) => {
    setEdges(prev =>
      prev.map(e => e.id === edgeId ? { ...e, isSevered: !e.isSevered } : e)
    );
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Adjust edge cost
  const adjustEdgeCost = (edgeId: string, delta: number) => {
    setEdges(prev =>
      prev.map(e => {
        if (e.id === edgeId) {
          const newCost = Math.max(1, Math.min(20, e.cost + delta));
          return { ...e, cost: newCost };
        }
        return e;
      })
    );
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Sever link A-B shortcut
  const isABSevered = edges.find(e => e.id === 'A-B')?.isSevered;

  // Reset topology and steps
  const handleReset = () => {
    setEdges(prev => prev.map(e => ({ ...e, isSevered: false })));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Computed LSDB
  const lsdb = useMemo(() => generateLSDB(nodes, edges), [nodes, edges]);

  // Determine tree edges in the current step
  const treeEdges = useMemo(() => {
    const activeTree: string[] = [];
    const pred = step.predecessors;
    for (const [nodeId, parentId] of Object.entries(pred)) {
      if (parentId) {
        const edge = edges.find(
          e => !e.isSevered &&
          ((e.source === parentId && e.target === nodeId) || (e.target === parentId && e.source === nodeId))
        );
        if (edge) {
          activeTree.push(edge.id);
        }
      }
    }
    return activeTree;
  }, [step.predecessors, edges]);

  return (
    <section id="link-state-engine" className="relative w-full bg-black py-16 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <HudHeader
          badgeNumber="SECTION 03"
          badgeLabel="LINK-STATE ENGINE"
          title="THE LINK-STATE ENGINE & DIJKSTRA SPF VISUALIZER"
          subtitle="Explore the deterministic inner mechanics of Dijkstra's Shortest Path First (SPF) algorithm executed over a synchronized Link-State Database (LSDB)."
          accentColor="white"
          rightSlot={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleSeverEdge('A-B')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-['JetBrains_Mono'] flex items-center gap-1.5 transition-all ${
                  isABSevered
                    ? 'bg-white/15 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/30 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                {isABSevered ? 'Restore Link A-B' : 'Sever Link A-B'}
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-['JetBrains_Mono'] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          }
        />

        {/* Control & Telemetry Bar */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Source Router Picker */}
          <div className="flex items-center gap-3">
            <span className="font-['JetBrains_Mono'] text-xs text-zinc-400 uppercase tracking-wider">
              ROOT SOURCE (s):
            </span>
            <div className="flex gap-1.5">
              {(['A', 'B', 'C', 'D', 'E', 'F'] as NodeId[]).map(nid => (
                <button
                  key={nid}
                  onClick={() => {
                    setSourceNode(nid);
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className={`w-8 h-8 rounded-lg font-['JetBrains_Mono'] text-xs font-bold transition-all ${
                    sourceNode === nid
                      ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {nid}
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-['JetBrains_Mono'] text-xs transition-colors flex items-center gap-1.5"
              title="Reset Algorithm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-white text-black font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_12px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause SPF' : 'Auto-Play SPF (1.2s)'}
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < steps.length - 1) {
                  setCurrentStepIndex(prev => prev + 1);
                }
              }}
              disabled={currentStepIndex >= steps.length - 1}
              className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-white font-['JetBrains_Mono'] text-xs font-medium flex items-center gap-1.5 disabled:opacity-30 transition-colors"
            >
              Step Forward
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="font-['JetBrains_Mono'] text-xs text-zinc-500">
              STEP {currentStepIndex + 1} / {steps.length}
            </span>
            <div className="w-28 h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Grid: Interactive SVG Topology + Live Math & Relaxation Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Topology Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-zinc-950/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 pointer-events-none hud-grid-pattern opacity-30" />
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-white" />
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white uppercase tracking-wider">
                  OSPF AREA 0.0.0.0 // 6-NODE MESH TOPOLOGY
                </span>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-zinc-500">
                Click links to toggle cost • Click nodes to root
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="relative z-10 w-full h-[400px] flex items-center justify-center">
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
                  const isInTree = treeEdges.includes(edge.id);
                  const isBeingRelaxed =
                    (step.relaxedEdge?.from === edge.source && step.relaxedEdge?.to === edge.target) ||
                    (step.relaxedEdge?.from === edge.target && step.relaxedEdge?.to === edge.source);

                  const midX = (sNode.x + tNode.x) / 2;
                  const midY = (sNode.y + tNode.y) / 2;

                  return (
                    <g key={edge.id} className="cursor-pointer">
                      {/* Base line */}
                      <line
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke={
                          isSevered
                            ? '#52525b'
                            : isInTree
                            ? '#ffffff'
                            : isBeingRelaxed
                            ? '#a1a1aa'
                            : '#27272a'
                        }
                        strokeWidth={isInTree ? 2.5 : isBeingRelaxed ? 2 : 1.5}
                        strokeDasharray={isSevered ? '4 4' : undefined}
                        filter={isInTree ? 'url(#glow-white)' : undefined}
                        className="transition-colors duration-300"
                      />

                      {/* Edge Cost Tag Badge */}
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={() => toggleSeverEdge(edge.id)}
                      >
                        <rect
                          x="-22"
                          y="-11"
                          width="44"
                          height="22"
                          rx="5"
                          fill={isSevered ? '#18181b' : isInTree ? '#27272a' : '#09090b'}
                          stroke={isSevered ? '#52525b' : isInTree ? '#ffffff' : '#3f3f46'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={isSevered ? '#71717a' : isInTree ? '#ffffff' : '#e4e4e7'}
                          fontSize="11"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {isSevered ? 'CUT' : `c=${edge.cost}`}
                        </text>
                      </g>

                      {/* Cost increment/decrement buttons on hover */}
                      {!isSevered && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <circle
                            cx="-32"
                            cy="0"
                            r="7"
                            fill="#27272a"
                            stroke="#52525b"
                            strokeWidth="1"
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustEdgeCost(edge.id, -1);
                            }}
                          />
                          <text
                            x="-32"
                            y="3"
                            textAnchor="middle"
                            fill="#a1a1aa"
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustEdgeCost(edge.id, -1);
                            }}
                          >
                            -
                          </text>

                          <circle
                            cx="32"
                            cy="0"
                            r="7"
                            fill="#27272a"
                            stroke="#52525b"
                            strokeWidth="1"
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustEdgeCost(edge.id, 1);
                            }}
                          />
                          <text
                            x="32"
                            y="3"
                            textAnchor="middle"
                            fill="#a1a1aa"
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustEdgeCost(edge.id, 1);
                            }}
                          >
                            +
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map(node => {
                  const isSettled = step.settledNodes.includes(node.id);
                  const isCurrent = step.currentNode === node.id;
                  const isExamining = step.examiningNeighbor === node.id;
                  const isRoot = sourceNode === node.id;
                  const distance = step.tentativeDistances[node.id];

                  let fillColor = '#09090b';
                  let strokeColor = '#3f3f46';
                  let textColor = '#e4e4e7';
                  let filter = undefined;

                  if (isSettled) {
                    strokeColor = '#ffffff';
                    textColor = '#ffffff';
                    filter = 'url(#glow-white)';
                  }
                  if (isCurrent) {
                    strokeColor = '#ffffff';
                    textColor = '#ffffff';
                    filter = 'url(#glow-white)';
                  }
                  if (isExamining) {
                    strokeColor = '#a1a1aa';
                    textColor = '#d4d4d8';
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => {
                        setSourceNode(node.id);
                        setCurrentStepIndex(0);
                        setIsPlaying(false);
                      }}
                    >
                      {/* Outer pulse circle for settled set N' */}
                      {isSettled && (
                        <circle
                          r="26"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                          className="opacity-70 animate-spin"
                          style={{ transformOrigin: '0 0', animationDuration: '10s' }}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r="20"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isCurrent || isSettled ? 2.5 : 1.5}
                        filter={filter}
                        className="transition-colors duration-300"
                      />

                      {/* Node Label */}
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

                      {/* Tentative Distance Metric Badge Above Node */}
                      <g transform="translate(0, -28)">
                        <rect
                          x="-24"
                          y="-9"
                          width="48"
                          height="18"
                          rx="4"
                          fill="#09090b"
                          stroke={isSettled ? '#ffffff' : isExamining ? '#a1a1aa' : '#27272a'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={distance === Infinity ? '#71717a' : isSettled ? '#ffffff' : '#e4e4e7'}
                          fontSize="10"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {distance === Infinity ? 'D=∞' : `D=${distance}`}
                        </text>
                      </g>

                      {/* IP Subtitle below Node */}
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

                      {/* Root Marker */}
                      {isRoot && (
                        <g transform="translate(0, 44)">
                          <rect
                            x="-18"
                            y="-6"
                            width="36"
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
                            ROOT
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom State Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-['JetBrains_Mono']">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  <span className="text-zinc-300">Settled Node Set N&apos;</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                  <span className="text-zinc-300">Shortest Path Tree (SPT)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  <span className="text-zinc-300">Relaxing Candidate</span>
                </div>
              </div>

              <div className="text-zinc-400">
                Settled: <span className="text-white font-bold">{step.settledNodes.length}</span> / {nodes.length} Routers
              </div>
            </div>
          </div>

          {/* Algorithmic Engine & Formula Inspector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Step Explanation & Event Console */}
            <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 text-xs font-['JetBrains_Mono'] text-zinc-500 uppercase tracking-wider">
                <span>SPF STATE MACHINE</span>
                <span className="text-white font-bold">CYCLE #{step.stepIndex}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 mb-4 min-h-[72px] flex items-center">
                <p className="font-['Geist'] text-zinc-200 text-xs leading-relaxed">
                  {step.explanation}
                </p>
              </div>

              {/* Settled Set Tracker N' */}
              <div className="mb-4">
                <div className="text-[10px] font-['JetBrains_Mono'] text-zinc-500 uppercase mb-1.5">
                  CURRENT SETTLED SET N&apos;
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-black/50 border border-white/10">
                  {nodes.map(n => {
                    const settled = step.settledNodes.includes(n.id);
                    return (
                      <span
                        key={n.id}
                        className={`px-2 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] font-bold transition-all ${
                          settled
                            ? 'bg-white/15 border border-white/40 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 border border-white/5 text-zinc-600'
                        }`}
                      >
                        {n.id}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Formula Relaxation Display */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-zinc-500 uppercase mb-1.5">
                  <span>Dijkstra Relaxation Equation</span>
                  <Calculator className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="p-3 rounded-lg bg-black border border-white/15 font-['JetBrains_Mono'] text-xs text-white overflow-x-auto">
                  <div className="text-white font-bold mb-1 text-[11px]">
                    D(v) = min( D(v), D(w) + c(w, v) )
                  </div>
                  <div className="text-zinc-400 text-[10px] border-t border-white/10 pt-1.5 mt-1">
                    {step.formulaState.calcString}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Routing Table from Root */}
            <div className="bg-zinc-950/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-['JetBrains_Mono'] text-zinc-500 uppercase tracking-wider">
                  <span>ROUTER {sourceNode} FORWARDING TABLE</span>
                  <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 text-[10px] uppercase">
                        <th className="pb-2">Dest</th>
                        <th className="pb-2">Metric</th>
                        <th className="pb-2">Next-Hop</th>
                        <th className="pb-2 text-right">Settled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {nodes.map(n => {
                        const dist = step.tentativeDistances[n.id];
                        const pred = step.predecessors[n.id];
                        const isSettled = step.settledNodes.includes(n.id);

                        return (
                          <tr key={n.id} className="text-zinc-300">
                            <td className="py-1.5 font-bold text-white">{n.id}</td>
                            <td className="py-1.5 text-white font-mono">
                              {dist === Infinity ? '∞' : dist}
                            </td>
                            <td className="py-1.5 text-zinc-400">
                              {n.id === sourceNode ? 'DIRECT' : pred ? pred : '-'}
                            </td>
                            <td className="py-1.5 text-right">
                              {isSettled ? (
                                <span className="text-white font-semibold text-[10px]">YES</span>
                              ) : (
                                <span className="text-zinc-600 text-[10px]">NO</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-zinc-500">
                <span>SPF Tree Root: Node {sourceNode}</span>
                <span className="text-white flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  Deterministic
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Live Link-State Database (LSDB) Inspector */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-white" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-white uppercase tracking-tight">
                  LIVE LINK-STATE DATABASE (LSDB) // AREA 0.0.0.0
                </h3>
              </div>
              <p className="font-['Geist'] text-zinc-400 text-xs mt-0.5">
                Every router in this area holds an identical cryptographic copy of these 6 flooded Link-State Packets (LSPs).
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-['JetBrains_Mono']">
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/20 text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LSDB SYNCHRONIZED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lsdb.map(lsp => {
              const isSource = lsp.routerId === sourceNode;
              return (
                <div
                  key={lsp.routerId}
                  className={`p-4 rounded-xl border transition-all ${
                    isSource
                      ? 'bg-white/[0.05] border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                      : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-white text-sm">
                      ROUTER-LSA: {lsp.routerId}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500">
                      AGE: {lsp.age}s
                    </span>
                  </div>

                  <div className="space-y-1 font-['JetBrains_Mono'] text-[11px] text-zinc-400 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Seq Number:</span>
                      <span className="text-white">{lsp.sequenceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Checksum:</span>
                      <span className="text-zinc-300">{lsp.checksum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Links Declared:</span>
                      <span className="text-white font-bold">{lsp.neighbors.length} Adjacencies</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] font-['JetBrains_Mono'] text-zinc-500 uppercase mb-1">
                      Advertised Neighbors & Metrics:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lsp.neighbors.length > 0 ? (
                        lsp.neighbors.map(nb => (
                          <span
                            key={nb.neighborId}
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-['JetBrains_Mono'] text-[10px] text-zinc-300"
                          >
                            Neighbor {nb.neighborId} <span className="text-zinc-400 font-mono">(c={nb.metric})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-['JetBrains_Mono'] text-zinc-500">
                          ALL ADJACENCIES SEVERED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

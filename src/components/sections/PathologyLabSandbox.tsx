import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { HudHeader } from '../common/HudHeader';
import {
  simulatePathologyRun,
} from '../../utils/graphAlgorithms';
import {
  type PathologyIteration,
} from '../../types/routing';
import {
  Scissors,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  AlertTriangle,
  ShieldCheck,
  Terminal,
  Send,
  Flame,
} from 'lucide-react';

export const PathologyLabSandbox: React.FC = () => {
  const [splitHorizon, setSplitHorizon] = useState<boolean>(false);
  const [poisonReverse, setPoisonReverse] = useState<boolean>(false);
  const [hopLimit16, setHopLimit16] = useState<boolean>(true);
  const [linkSevered, setLinkSevered] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [pingActive, setPingActive] = useState<boolean>(false);
  const [pingTtl, setPingTtl] = useState<number>(10);
  const [pingPosition, setPingPosition] = useState<'C' | 'B' | 'A' | 'DROPPED'>('C');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Compute simulation run based on mitigations
  const iterations: PathologyIteration[] = useMemo(() => {
    return simulatePathologyRun({
      splitHorizon,
      poisonReverse,
      hopLimit16
    });
  }, [splitHorizon, poisonReverse, hopLimit16]);

  const activeStep = iterations[currentStepIndex] || iterations[0];

  useEffect(() => {
    if (!linkSevered) {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } else if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  }, [linkSevered, currentStepIndex]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < iterations.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, iterations.length]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStepIndex]);

  // Ping test simulation
  const dispatchPing = () => {
    if (pingActive) return;
    setPingActive(true);
    setPingPosition('C');
    setPingTtl(6);

    let ttl = 6;
    let pos: 'C' | 'B' | 'A' | 'DROPPED' = 'C';

    const timer = setInterval(() => {
      if (!linkSevered) {
        // Normal delivery: C -> B -> A
        if (pos === 'C') {
          pos = 'B';
        } else if (pos === 'B') {
          pos = 'A';
          clearInterval(timer);
          setTimeout(() => setPingActive(false), 1200);
        }
      } else {
        // Link A-B is severed!
        if (activeStep.bState.distanceToA === Infinity) {
          // Dropped at B
          if (pos === 'C') {
            pos = 'B';
          } else {
            pos = 'DROPPED';
            clearInterval(timer);
            setTimeout(() => setPingActive(false), 1500);
          }
        } else {
          // Bouncing loop between B and C!
          ttl -= 1;
          setPingTtl(ttl);
          if (ttl <= 0) {
            pos = 'DROPPED';
            clearInterval(timer);
            setTimeout(() => setPingActive(false), 1500);
          } else {
            pos = pos === 'C' ? 'B' : 'C';
          }
        }
      }
      setPingPosition(pos);
    }, 600);
  };

  const isLoopActive =
    linkSevered &&
    activeStep.bState.nextHopToA === 'C' &&
    activeStep.cState.nextHopToA === 'B' &&
    activeStep.bState.distanceToA < 16;

  return (
    <section id="pathology-lab" className="relative w-full bg-black py-16 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <HudHeader
          badgeNumber="SECTION 05"
          badgeLabel="PATHOLOGY LAB"
          title="PATHOLOGY LAB // COUNT-TO-INFINITY & LOOP MITIGATION"
          subtitle="A live sandbox reproducing the classic Bellman-Ford failure mode. When a physical link drops, witness how distance-vector routers exchange stale rumors, triggering positive feedback loops that count to infinity."
          accentColor="white"
          rightSlot={
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-['JetBrains_Mono'] border flex items-center gap-1.5 ${
                isLoopActive
                  ? 'bg-white/10 border-white/40 text-white animate-pulse'
                  : 'bg-white/5 border-white/20 text-zinc-300'
              }`}>
                {isLoopActive ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-white" />
                    CRITICAL: ROUTING LOOP ACTIVE
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    LOOP MITIGATED / STABLE
                  </>
                )}
              </span>
            </div>
          }
        />

        {/* Interactive Controls & Mitigations Bar */}
        <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Fault Injection Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLinkSevered(!linkSevered);
                  if (linkSevered) {
                    setCurrentStepIndex(0);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-2 transition-all ${
                  linkSevered
                    ? 'bg-white text-black font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Scissors className="w-4 h-4" />
                {linkSevered ? '[LINK A-B SEVERED]' : '[SEVER LINK A-B]'}
              </button>

              <button
                onClick={() => {
                  setLinkSevered(false);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-['JetBrains_Mono'] text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Topology
              </button>
            </div>

            {/* Mitigation Toggles */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-['JetBrains_Mono']">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px]">MITIGATION CONTROLS:</span>

              {/* Split Horizon */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={splitHorizon}
                  onChange={(e) => {
                    setSplitHorizon(e.target.checked);
                    if (e.target.checked) setPoisonReverse(false);
                    setCurrentStepIndex(linkSevered ? 1 : 0);
                  }}
                  className="rounded border-zinc-700 accent-white bg-zinc-900 cursor-pointer"
                />
                <span className={splitHorizon ? 'text-white font-bold' : 'text-zinc-400'}>
                  [x] Split Horizon (never advertise route back to supplier)
                </span>
              </label>

              {/* Poison Reverse */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={poisonReverse}
                  onChange={(e) => {
                    setPoisonReverse(e.target.checked);
                    if (e.target.checked) setSplitHorizon(false);
                    setCurrentStepIndex(linkSevered ? 1 : 0);
                  }}
                  className="rounded border-zinc-700 accent-white bg-zinc-900 cursor-pointer"
                />
                <span className={poisonReverse ? 'text-white font-bold' : 'text-zinc-400'}>
                  [x] Poison Reverse (explicitly advertise metric ∞)
                </span>
              </label>

              {/* Hop-Count Ceiling */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hopLimit16}
                  onChange={(e) => {
                    setHopLimit16(e.target.checked);
                    setCurrentStepIndex(linkSevered ? 1 : 0);
                  }}
                  className="rounded border-zinc-700 accent-white bg-zinc-900 cursor-pointer"
                />
                <span className={hopLimit16 ? 'text-white font-bold' : 'text-zinc-400'}>
                  [x] Hop-Count Ceiling (16 = ∞, RFC 2453)
                </span>
              </label>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!linkSevered}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Auto-Step'}
              </button>

              <button
                onClick={() => {
                  if (currentStepIndex < iterations.length - 1) {
                    setCurrentStepIndex(prev => prev + 1);
                  }
                }}
                disabled={!linkSevered || currentStepIndex >= iterations.length - 1}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 disabled:opacity-30 transition-colors"
              >
                Step
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Main Grid: Linear Topology Visualization + Monospace Sniffer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Linear Topology Interactive SVG (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-950/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 pointer-events-none hud-grid-pattern opacity-30" />

            <div className="relative z-10 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white uppercase tracking-wider">
                  SCENARIO TOPOLOGY // LINEAR 3-ROUTER BUS (A ↔ B ↔ C)
                </span>
              </div>
              <span className="text-xs font-['JetBrains_Mono'] text-zinc-400">
                Iteration: <strong className="text-white">{activeStep.iteration}</strong> / {iterations.length - 1}
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="relative z-10 w-full h-[320px] flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 240">
                <defs>
                  <filter id="glow-white" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Link A-B */}
                <line
                  x1="120"
                  y1="110"
                  x2="280"
                  y2="110"
                  stroke={linkSevered ? '#52525b' : '#ffffff'}
                  strokeWidth="2.5"
                  strokeDasharray={linkSevered ? '6 6' : undefined}
                />

                {/* Severed marker or link cost */}
                <g transform="translate(200, 110)">
                  <rect
                    x="-24"
                    y="-11"
                    width="48"
                    height="22"
                    rx="5"
                    fill={linkSevered ? '#18181b' : '#09090b'}
                    stroke={linkSevered ? '#52525b' : '#3f3f46'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={linkSevered ? '#71717a' : '#ffffff'}
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {linkSevered ? 'SEVERED' : 'c=1'}
                  </text>
                </g>

                {/* Link B-C */}
                <line
                  x1="320"
                  y1="110"
                  x2="480"
                  y2="110"
                  stroke={isLoopActive ? '#ffffff' : '#52525b'}
                  strokeWidth="2.5"
                  filter={isLoopActive ? 'url(#glow-white)' : undefined}
                />
                <g transform="translate(400, 110)">
                  <rect
                    x="-20"
                    y="-11"
                    width="40"
                    height="22"
                    rx="5"
                    fill={isLoopActive ? '#18181b' : '#09090b'}
                    stroke={isLoopActive ? '#ffffff' : '#3f3f46'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={isLoopActive ? '#ffffff' : '#a1a1aa'}
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    c=1
                  </text>
                </g>

                {/* Bouncing Loop Indicators between B and C */}
                {isLoopActive && (
                  <g>
                    <motion.circle
                      r="6"
                      fill="#ffffff"
                      filter="url(#glow-white)"
                      animate={{
                        cx: [320, 480, 320],
                        cy: [90, 90, 90]
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <text
                      x="400"
                      y="80"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      className="animate-pulse"
                    >
                      STALE RUMOR BOUNCE (LOOP ACTIVE)
                    </text>
                  </g>
                )}

                {/* Node A (Destination Target) */}
                <g transform="translate(100, 110)">
                  <circle
                    r="24"
                    fill="#09090b"
                    stroke={linkSevered ? '#52525b' : '#ffffff'}
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill={linkSevered ? '#71717a' : '#ffffff'}
                    fontSize="16"
                    fontFamily="Plus Jakarta Sans"
                    fontWeight="bold"
                  >
                    A
                  </text>
                  <text
                    x="0"
                    y="-32"
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    TARGET DEST
                  </text>
                  <text
                    x="0"
                    y="42"
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    10.0.0.1
                  </text>
                </g>

                {/* Node B */}
                <g transform="translate(300, 110)">
                  <circle
                    r="24"
                    fill="#09090b"
                    stroke={isLoopActive ? '#ffffff' : '#52525b'}
                    strokeWidth={isLoopActive ? 2.5 : 1.5}
                    filter={isLoopActive ? 'url(#glow-white)' : undefined}
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill={isLoopActive ? '#ffffff' : '#e4e4e7'}
                    fontSize="16"
                    fontFamily="Plus Jakarta Sans"
                    fontWeight="bold"
                  >
                    B
                  </text>

                  {/* Metrics Box Above Node B */}
                  <g transform="translate(0, -42)">
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="4"
                      fill="#09090b"
                      stroke={isLoopActive ? '#ffffff' : '#3f3f46'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isLoopActive ? '#ffffff' : '#e4e4e7'}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {activeStep.bState.distanceToA === Infinity
                        ? 'D(A)=∞'
                        : `D(A)=${activeStep.bState.distanceToA} via ${activeStep.bState.nextHopToA}`}
                    </text>
                  </g>
                  <text
                    x="0"
                    y="42"
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    10.0.1.1
                  </text>
                </g>

                {/* Node C */}
                <g transform="translate(500, 110)">
                  <circle
                    r="24"
                    fill="#09090b"
                    stroke={isLoopActive ? '#ffffff' : '#52525b'}
                    strokeWidth={isLoopActive ? 2.5 : 1.5}
                    filter={isLoopActive ? 'url(#glow-white)' : undefined}
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill={isLoopActive ? '#ffffff' : '#e4e4e7'}
                    fontSize="16"
                    fontFamily="Plus Jakarta Sans"
                    fontWeight="bold"
                  >
                    C
                  </text>

                  {/* Metrics Box Above Node C */}
                  <g transform="translate(0, -42)">
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="4"
                      fill="#09090b"
                      stroke={isLoopActive ? '#ffffff' : '#3f3f46'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isLoopActive ? '#ffffff' : '#e4e4e7'}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {activeStep.cState.distanceToA === Infinity
                        ? 'D(A)=∞'
                        : `D(A)=${activeStep.cState.distanceToA} via ${activeStep.cState.nextHopToA}`}
                    </text>
                  </g>
                  <text
                    x="0"
                    y="42"
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    10.0.2.1
                  </text>
                </g>

                {/* Test Packet Ping Dot */}
                {pingActive && (
                  <motion.g
                    animate={{
                      x: pingPosition === 'C' ? 500 : pingPosition === 'B' ? 300 : pingPosition === 'A' ? 100 : 300,
                      y: pingPosition === 'DROPPED' ? 150 : 110
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <circle r="7" fill={pingPosition === 'DROPPED' ? '#71717a' : '#ffffff'} />
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fill={pingPosition === 'DROPPED' ? '#a1a1aa' : '#ffffff'}
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {pingPosition === 'DROPPED' ? 'PACKET DROPPED' : `TTL=${pingTtl}`}
                    </text>
                  </motion.g>
                )}
              </svg>
            </div>

            {/* Test Ping Trigger & Status */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={dispatchPing}
                disabled={pingActive}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Probe Packet (C → A)
              </button>

              <div className="text-xs font-['JetBrains_Mono'] text-zinc-400">
                {isLoopActive ? (
                  <span className="text-white font-mono">
                    Looping: Packets bounce B ↔ C until TTL exhaustion!
                  </span>
                ) : (
                  <span className="text-zinc-400 font-mono">
                    Normal Path: Packets route cleanly without cyclic trapping.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Packet Sniffer Monospace Terminal (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-zinc-400 font-['JetBrains_Mono'] text-xs">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span>TELEMETRY PACKET SNIFFER // RAW RIP/DV PAYLOAD STREAM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="text-[10px] font-['JetBrains_Mono'] text-zinc-500">PROMISCUOUS</span>
                </div>
              </div>

              {/* Terminal Log Stream */}
              <div className="h-[280px] overflow-y-auto font-['JetBrains_Mono'] text-[11px] space-y-2 pr-2 text-zinc-300 select-text">
                <div className="text-zinc-600">// Sniffer initialized on eth0/eth1 socket AF_PACKET (Promiscuous Mode)</div>
                
                {iterations.slice(0, currentStepIndex + 1).map((it, idx) => (
                  <div key={idx} className="p-2 rounded bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>FRAME #00{idx + 1} • ITERATION {it.iteration}</span>
                      <span className={it.linkSevered ? 'text-white font-bold' : 'text-zinc-500'}>
                        {it.linkSevered ? 'FAULT STATE' : 'NOMINAL'}
                      </span>
                    </div>

                    <div className="text-white text-xs">
                      {it.eventLog}
                    </div>

                    {it.packetExchanged && (
                      <div className="bg-black/60 p-2 rounded font-mono text-[10px] text-zinc-400 border border-white/5 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">RIPv2-RESPONSE:</span>
                          <span className="text-zinc-500">24 BYTES • PORT 520</span>
                        </div>
                        <div className="text-zinc-300">
                          SRC: {it.packetExchanged.from} (10.0.{it.packetExchanged.from === 'B' ? '1' : '2'}.1) → DST: {it.packetExchanged.to} (224.0.0.9)
                        </div>
                        <div className="text-zinc-400">
                          ENTRY: Net=10.0.0.0/24 NextHop=0.0.0.0 <span className="text-white font-bold">Metric={it.packetExchanged.advertisedCost}</span>
                        </div>
                        {it.packetExchanged.type === 'POISONED_REVERSE' && (
                          <div className="text-white font-bold">
                            [POISON REVERSE ACTIVATED: Metric 16 explicitly advertised back to supplier B]
                          </div>
                        )}
                        {it.packetExchanged.type === 'SPLIT_HORIZON_SUPPRESSED' && (
                          <div className="text-white font-bold">
                            [SPLIT HORIZON ACTIVE: Advertisement of route A back out ingress interface suppressed]
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* Mechanics Explanation Footer */}
            <div className="pt-3 border-t border-white/10 text-[11px] font-['Geist'] text-zinc-400">
              <span className="font-bold text-white">Why Count-to-Infinity occurs:</span> When Link A-B fails, B accepts C&apos;s rumor that it can reach A without knowing C&apos;s route was originally through B! Mitigations break this mutual dependency.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

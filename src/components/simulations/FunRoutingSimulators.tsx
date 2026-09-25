import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Coffee,
  RotateCcw,
  Send,
  Scissors,
  CheckCircle2,
  Terminal,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function FunRoutingSimulators() {
  const [activeTab, setActiveTab] = useState<'dijkstra' | 'bellman'>('dijkstra');

  // =========================================================================
  // SIMULATOR 1: THE LAZY PACKET GPS (Dijkstra SPF)
  // =========================================================================
  const [coffeeSpilled, setCoffeeSpilled] = useState<boolean>(false);
  const [isPacketMoving, setIsPacketMoving] = useState<boolean>(false);
  const [spfCalculated, setSpfCalculated] = useState<boolean>(true);
  const [dijkstraStatus, setDijkstraStatus] = useState<string>(
    'Packet pkt_0x42 demands the path of least resistance. Standing by at Home.'
  );
  const [dijkstraLog, setDijkstraLog] = useState<string[]>([
    'INIT: Dijkstra SPF computed optimal tree from Root [Home].',
    'Shortest Path: Home ➔ R1 ➔ Dest (Total Cost: 5ms).',
  ]);

  // Costs
  const r1DestCost = coffeeSpilled ? 45 : 2;
  const pathR1Total = 3 + r1DestCost; // Home->R1(3) + R1->Dest
  const pathR2Total = 4 + 4; // Home->R2(4) + R2->Dest(4) = 8ms
  const activePathChoice = pathR1Total < pathR2Total ? 'r1' : 'r2';
  const totalCost = activePathChoice === 'r1' ? pathR1Total : pathR2Total;

  const handleToggleCoffee = () => {
    const nextSpill = !coffeeSpilled;
    setCoffeeSpilled(nextSpill);
    setSpfCalculated(true);

    if (nextSpill) {
      setDijkstraStatus(
        'Coffee spilled on fiber! Dijkstra recalculates in 0.04ms: Rerouting via R2.'
      );
      setDijkstraLog((prev) => [
        `[!] COFFEE ACCIDENT: Link R1—Dest impedance surged to 45ms.`,
        `Dijkstra Relaxation: D(Dest) updated from 5ms ➔ 8ms via R2.`,
        ...prev.slice(0, 3),
      ]);
    } else {
      setDijkstraStatus(
        'Fiber cleaned and dried. Link R1—Dest restored to 2ms. Resuming hyper-speed path.'
      );
      setDijkstraLog((prev) => [
        `[*] LINK RESTORED: Link R1—Dest normalized to 2ms.`,
        `Dijkstra Relaxation: D(Dest) restored to 5ms via R1.`,
        ...prev.slice(0, 3),
      ]);
    }
  };

  const handleRunSpf = () => {
    setSpfCalculated(true);
    setDijkstraStatus(
      `Dijkstra SPF computed: Settled set N' = {Home, ${
        activePathChoice === 'r1' ? 'R1, Dest' : 'R2, Dest'
      }}. Lowest cost: ${totalCost}ms.`
    );
    setDijkstraLog((prev) => [
      `SPF RELAXATION COMPLETE: Root=[Home], Dest=[Dest], Latency=${totalCost}ms.`,
      ...prev.slice(0, 3),
    ]);
  };

  const handleDispatchPacket = () => {
    if (isPacketMoving) return;
    setIsPacketMoving(true);
    setDijkstraStatus(
      `Packet in flight along ${
        activePathChoice === 'r1' ? 'Home ➔ R1 ➔ Dest' : 'Home ➔ R2 ➔ Dest'
      } (${totalCost}ms).`
    );

    setTimeout(() => {
      setIsPacketMoving(false);
      setDijkstraStatus('Packet arrived safely without breaking a sweat.');
      setDijkstraLog((prev) => [
        `DELIVERY SUCCESS: 64 bytes delivered to Dest in ${totalCost}ms. TTL remaining: 62.`,
        ...prev.slice(0, 3),
      ]);
    }, 1800);
  };

  const handleResetDijkstra = () => {
    setCoffeeSpilled(false);
    setIsPacketMoving(false);
    setSpfCalculated(true);
    setDijkstraStatus('Topology reset. Ready for experimentation.');
    setDijkstraLog([
      'INIT: Dijkstra SPF computed optimal tree from Root [Home].',
      'Shortest Path: Home ➔ R1 ➔ Dest (Total Cost: 5ms).',
    ]);
  };

  // =========================================================================
  // SIMULATOR 2: THE RUMOR MILL & DONUT CRISIS (Bellman-Ford / Count-to-Infinity)
  // =========================================================================
  const [cableCut, setCableCut] = useState<boolean>(false);
  const [splitHorizon, setSplitHorizon] = useState<boolean>(false);
  const [poisonReverse, setPoisonReverse] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);
  const [bobMetric, setBobMetric] = useState<number>(1);
  const [bobNextHop, setBobNextHop] = useState<string>('Alice');
  const [charlieMetric, setCharlieMetric] = useState<number>(2);
  const [charlieNextHop, setCharlieNextHop] = useState<string>('Bob');
  const [gossipStatus, setGossipStatus] = useState<string>(
    'Donut shop is open! Charlie trusts Bob, Bob sees Alice directly.'
  );
  const [gossipLog, setGossipLog] = useState<string[]>([
    'STEADY STATE: Alice supplies fresh donuts. Bob cost = 1, Charlie cost = 2.',
  ]);

  const getStatusBadge = () => {
    if (!cableCut) return { label: 'Optimal Rumor Sync', color: 'text-zinc-300 border-white/20' };
    if (splitHorizon || poisonReverse)
      return { label: 'Loop Neutralized (Mitigated)', color: 'text-white border-white' };
    if (bobMetric >= 16)
      return { label: 'Infinity Clamp (RFC 2453)', color: 'text-white bg-white/10 border-white' };
    if (bobMetric > 8)
      return { label: 'Status: Total Delusion', color: 'text-zinc-200 border-white/40' };
    if (bobMetric > 4)
      return { label: 'Status: Growing Gossip Loop', color: 'text-zinc-300 border-white/30' };
    return { label: 'Status: Mild Confusion', color: 'text-zinc-400 border-white/20' };
  };

  const handleCutCable = () => {
    setCableCut(true);
    setStepCount(1);

    if (splitHorizon || poisonReverse) {
      setBobMetric(16);
      setBobNextHop('Unreachable (∞)');
      setCharlieMetric(16);
      setCharlieNextHop('Unreachable (∞)');
      setGossipStatus(
        splitHorizon
          ? "Charlie refused to regurgitate Bob's own rumor back to Bob. Loop neutralized!"
          : 'Poison Reverse active: Charlie advertised cost ∞ (16) back to Bob. Loop severed immediately!'
      );
      setGossipLog((prev) => [
        `[!] SABOTAGE: Link Alice—Bob severed!`,
        splitHorizon
          ? `SPLIT HORIZON ACTIVE: Charlie withholds route out interface facing Bob. Route purged.`
          : `POISON REVERSE ACTIVE: Charlie sends triggered metric 16 back to Bob. Loop broken instantly.`,
        ...prev.slice(0, 3),
      ]);
    } else {
      // Step 1 without mitigation: Bob believes Charlie's old rumor
      setBobMetric(3);
      setBobNextHop('Charlie');
      setGossipStatus(
        "Bob: 'Alice is gone, but Charlie says he can reach her in 2 hops! I route via Charlie (Cost: 3).'"
      );
      setGossipLog((prev) => [
        `[!] DONUT EMERGENCY: Alice's cable cut! Bob loses direct route.`,
        `GOSSIP TURN 1: Bob trusts stale rumor from Charlie (2 + 1 = 3). Next-hop: Charlie.`,
        ...prev.slice(0, 3),
      ]);
    }
  };

  const handleNextGossip = () => {
    if (!cableCut) return;
    if (bobMetric >= 16 && charlieMetric >= 16) {
      setGossipStatus('RIP Limit 16 reached! Metric clamped to infinity. Office sanity restored.');
      return;
    }

    const nextStep = stepCount + 1;
    setStepCount(nextStep);

    if (nextStep % 2 === 0) {
      // Charlie updates based on Bob's higher cost
      const newCost = Math.min(bobMetric + 1, 16);
      setCharlieMetric(newCost);
      setCharlieNextHop('Bob');
      if (newCost >= 16) {
        setGossipStatus(`Charlie to Bob: 'My cost hit 16 (∞)! The donuts are a total lie!'`);
      } else {
        setGossipStatus(
          `Charlie: 'Bob's cost went up to ${bobMetric}! My path through Bob is now ${newCost}.'`
        );
      }
      setGossipLog((prev) => [
        `GOSSIP TURN ${nextStep}: Charlie recalculates through Bob: ${bobMetric} + 1 = ${newCost}.`,
        ...prev.slice(0, 3),
      ]);
    } else {
      // Bob updates based on Charlie's higher cost
      const newCost = Math.min(charlieMetric + 1, 16);
      setBobMetric(newCost);
      setBobNextHop('Charlie');
      if (newCost >= 16) {
        setGossipStatus(`Bob: 'Wait, Charlie's cost is 16 too. Route marked unreachable (∞)!'`);
      } else {
        setGossipStatus(
          `Bob to Charlie: 'Nevermind, Charlie! Since your cost is ${charlieMetric}, mine is now ${newCost}!'`
        );
      }
      setGossipLog((prev) => [
        `GOSSIP TURN ${nextStep}: Bob recalculates through Charlie: ${charlieMetric} + 1 = ${newCost}.`,
        ...prev.slice(0, 3),
      ]);
    }
  };

  const handleResetBellman = () => {
    setCableCut(false);
    setStepCount(0);
    setBobMetric(1);
    setBobNextHop('Alice');
    setCharlieMetric(2);
    setCharlieNextHop('Bob');
    setGossipStatus('Donut shop is open! Charlie trusts Bob, Bob sees Alice directly.');
    setGossipLog([
      'STEADY STATE: Alice supplies fresh donuts. Bob cost = 1, Charlie cost = 2.',
    ]);
  };

  return (
    <div className="w-full flex flex-col gap-8 font-['Geist'] text-zinc-300">
      {/* Module Title Banner */}
      <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 sm:p-8 hover:border-white/20 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            <span className="font-['JetBrains_Mono'] text-xs font-bold text-zinc-400 uppercase tracking-widest">
              [04] INTERACTIVE LABS • CAPSTONE EXPERIMENTATION
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 font-['JetBrains_Mono'] text-[11px] text-zinc-400">
            SIMULATION ENGINE // 60 FPS
          </span>
        </div>

        <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
          Visual Routing Mechanics
        </h1>
        <p className="font-['Geist'] text-zinc-400 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          Explore single-source shortest path adaptation against decentralized rumor loops. Zero cognitive overload, witty cause-and-effect triggers, and real-time algorithmic telemetry.
        </p>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap gap-2.5 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('dijkstra')}
            className={`px-4 py-2.5 rounded-xl font-['JetBrains_Mono'] text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dijkstra'
                ? 'bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                : 'bg-zinc-950/90 text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            01 // The Lazy Packet GPS (Link-State SPF)
          </button>

          <button
            onClick={() => setActiveTab('bellman')}
            className={`px-4 py-2.5 rounded-xl font-['JetBrains_Mono'] text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bellman'
                ? 'bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                : 'bg-zinc-950/90 text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            02 // The Rumor Mill &amp; Donut Crisis (Distance-Vector)
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SIMULATOR 1: THE LAZY PACKET GPS (Dijkstra SPF)                    */}
      {/* =================================================================== */}
      {activeTab === 'dijkstra' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Main Simulation Workbench Card */}
          <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 sm:p-8 relative overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  MISSION OBJECTIVE
                </span>
                <p className="font-['Geist'] text-sm text-zinc-300">
                  Deliver packet from <strong className="text-white font-semibold">[Home]</strong> to <strong className="text-white font-semibold">[Dest]</strong> via minimal cumulative latency.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRunSpf}
                  className="px-3.5 py-2 rounded-xl text-xs font-['JetBrains_Mono'] font-bold border border-white/20 text-zinc-300 hover:text-white hover:border-white/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  Run Dijkstra SPF
                </button>

                <button
                  onClick={handleToggleCoffee}
                  className={`px-3.5 py-2 rounded-xl text-xs font-['JetBrains_Mono'] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    coffeeSpilled
                      ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'border-white/20 text-zinc-300 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  {coffeeSpilled ? '☕ Clean Up Coffee' : '☕ Spill Coffee on Link (R1-Dest)'}
                </button>

                <button
                  onClick={handleDispatchPacket}
                  disabled={isPacketMoving}
                  className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] font-extrabold bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPacketMoving ? 'Dispatching...' : 'Dispatch Packet'}
                </button>

                <button
                  onClick={handleResetDijkstra}
                  title="Reset Topology"
                  className="p-2 rounded-xl border border-white/10 text-zinc-500 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 5-Node Topology SVG Visualization */}
            <div className="relative w-full h-80 sm:h-96 flex items-center justify-center bg-black/60 rounded-xl border border-white/5 p-4 overflow-hidden">
              <svg
                viewBox="0 0 680 320"
                className="w-full h-full max-w-2xl select-none"
                style={{ overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Background Grid Accent */}
                <g opacity="0.05" stroke="#ffffff" strokeWidth="0.5">
                  <line x1="0" y1="80" x2="680" y2="80" strokeDasharray="4 4" />
                  <line x1="0" y1="160" x2="680" y2="160" strokeDasharray="4 4" />
                  <line x1="0" y1="240" x2="680" y2="240" strokeDasharray="4 4" />
                  <line x1="170" y1="0" x2="170" y2="320" strokeDasharray="4 4" />
                  <line x1="340" y1="0" x2="340" y2="320" strokeDasharray="4 4" />
                  <line x1="510" y1="0" x2="510" y2="320" strokeDasharray="4 4" />
                </g>

                {/* Inactive Links */}
                {/* Home to R1 */}
                <line x1="90" y1="160" x2="270" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {/* Home to R2 */}
                <line x1="90" y1="160" x2="340" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {/* Home to R3 */}
                <line x1="90" y1="160" x2="270" y2="250" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {/* R1 to Dest */}
                <line
                  x1="270"
                  y1="70"
                  x2="590"
                  y2="160"
                  stroke={coffeeSpilled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={coffeeSpilled ? '2' : '1.5'}
                  strokeDasharray={coffeeSpilled ? '6 4' : '0'}
                />
                {/* R2 to Dest */}
                <line x1="340" y1="160" x2="590" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {/* R3 to Dest */}
                <line x1="270" y1="250" x2="590" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                {/* Inter-router cross link R1-R2 */}
                <line x1="270" y1="70" x2="340" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                {/* Inter-router cross link R2-R3 */}
                <line x1="340" y1="160" x2="270" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Highlighted Shortest Path Tree */}
                {spfCalculated && (
                  <>
                    {activePathChoice === 'r1' ? (
                      <g>
                        <line x1="90" y1="160" x2="270" y2="70" stroke="#ffffff" strokeWidth="3" />
                        <line x1="270" y1="70" x2="590" y2="160" stroke="#ffffff" strokeWidth="3" />
                      </g>
                    ) : (
                      <g>
                        <line x1="90" y1="160" x2="340" y2="160" stroke="#ffffff" strokeWidth="3" />
                        <line x1="340" y1="160" x2="590" y2="160" stroke="#ffffff" strokeWidth="3" />
                      </g>
                    )}
                  </>
                )}

                {/* Metric Badges along links */}
                {/* Home - R1 */}
                <g transform="translate(170, 100)">
                  <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">3ms</text>
                </g>

                {/* Home - R2 */}
                <g transform="translate(205, 172)">
                  <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">4ms</text>
                </g>

                {/* Home - R3 */}
                <g transform="translate(170, 220)">
                  <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">6ms</text>
                </g>

                {/* R1 - Dest (Coffee Affected) */}
                <g transform="translate(440, 100)">
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="4"
                    fill={coffeeSpilled ? '#ffffff' : '#09090b'}
                    stroke={coffeeSpilled ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill={coffeeSpilled ? '#000000' : '#ffffff'}
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {coffeeSpilled ? '☕ 45ms' : '2ms'}
                  </text>
                </g>

                {/* R2 - Dest */}
                <g transform="translate(470, 172)">
                  <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">4ms</text>
                </g>

                {/* R3 - Dest */}
                <g transform="translate(440, 220)">
                  <rect x="-18" y="-10" width="36" height="20" rx="4" fill="#09090b" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">7ms</text>
                </g>

                {/* 5 Mesh Routers */}
                {[
                  { id: 'home', x: 90, y: 160, label: 'Home', sub: 'SRC', active: true },
                  { id: 'r1', x: 270, y: 70, label: 'R1', sub: 'Core-A', active: activePathChoice === 'r1' },
                  { id: 'r2', x: 340, y: 160, label: 'R2', sub: 'Core-B', active: activePathChoice === 'r2' },
                  { id: 'r3', x: 270, y: 250, label: 'R3', sub: 'Core-C', active: false },
                  { id: 'dest', x: 590, y: 160, label: 'Dest', sub: 'DEST', active: true },
                ].map((node) => (
                  <g key={node.id}>
                    {/* Glow outline if in active path */}
                    {node.active && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="25"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                        opacity="0.3"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      fill="#09090b"
                      stroke={node.active ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                      strokeWidth={node.active ? '2' : '1'}
                    />
                    <text
                      x={node.x}
                      y={node.y - 1}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="Plus Jakarta Sans"
                      fontWeight="bold"
                    >
                      {node.label}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 9}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                    >
                      {node.sub}
                    </text>
                  </g>
                ))}

                {/* Animated Packet Dot traversing the Active Shortest Path */}
                {isPacketMoving && (
                  <motion.g
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 1.7, ease: 'easeInOut' }}
                    style={{
                      offsetPath:
                        activePathChoice === 'r1'
                          ? "path('M 90 160 L 270 70 L 590 160')"
                          : "path('M 90 160 L 340 160 L 590 160')",
                    }}
                  >
                    <circle r="7" fill="#ffffff" filter="drop-shadow(0 0 8px rgba(255,255,255,0.9))" />
                    <circle r="3" fill="#000000" />
                  </motion.g>
                )}
              </svg>
            </div>

            {/* Live Telemetry Bar & Witty Status Pill */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090a0f] border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                  ACTIVE SPF PATH:{' '}
                  <strong className="text-white font-mono">
                    {activePathChoice === 'r1' ? 'Home ➔ R1 ➔ Dest (5ms)' : 'Home ➔ R2 ➔ Dest (8ms)'}
                  </strong>
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-200 italic">
                &ldquo;{dijkstraStatus}&rdquo;
              </span>
            </div>

            {/* Bottom 2-Column: Mathematical Equation & Event Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Formula Card */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider mb-2">
                    <Terminal className="w-3.5 h-3.5 text-white" />
                    Dijkstra Greedy Edge Relaxation Invariant
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center font-['JetBrains_Mono'] text-xs sm:text-sm text-white font-bold mb-2">
                    D(v) = min( D(v), D(w) + c(w, v) )
                  </div>
                  <p className="font-['Geist'] text-xs text-zinc-400 leading-relaxed">
                    Every node maintains synchronized full-topology visibility. When edge weights fluctuate (e.g. coffee spills), shortest-path trees recalculate locally with zero loops.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
                  COMPUTATIONAL COMPLEXITY: O(|E| + |V| log |V|)
                </div>
              </div>

              {/* Real-time Telemetry Event Log */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    Live Router Telemetry Stream
                  </div>
                  <div className="space-y-1.5 font-['JetBrains_Mono'] text-[11px] text-zinc-300">
                    {dijkstraLog.map((log, i) => (
                      <div key={i} className="truncate border-l border-white/20 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
                  PACKET PAYLOAD: 64B ICMP ECHO REQUEST
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SIMULATOR 2: THE RUMOR MILL & DONUT CRISIS (Bellman-Ford)          */}
      {/* =================================================================== */}
      {activeTab === 'bellman' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="rounded-2xl bg-[#090a0f] border border-white/10 p-6 sm:p-8 relative overflow-hidden">
            {/* Top Toolbar with Mitigation Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div>
                <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  PATHOLOGY WORKBENCH // RFC 2453
                </span>
                <p className="font-['Geist'] text-sm text-zinc-300">
                  Watch distance-vector rumor routing struggle with broken telephone when the donut cable is severed.
                </p>
              </div>

              {/* Mitigations Checkboxes & Sabotage Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Split Horizon Toggle */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-['JetBrains_Mono'] text-zinc-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={splitHorizon}
                    onChange={(e) => {
                      setSplitHorizon(e.target.checked);
                      if (e.target.checked && cableCut) {
                        setBobMetric(16);
                        setBobNextHop('Unreachable (∞)');
                        setCharlieMetric(16);
                        setCharlieNextHop('Unreachable (∞)');
                      }
                    }}
                    className="accent-white cursor-pointer"
                  />
                  <span>Split Horizon (&quot;Don&apos;t talk back&quot;)</span>
                </label>

                {/* Poison Reverse Toggle */}
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-['JetBrains_Mono'] text-zinc-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={poisonReverse}
                    onChange={(e) => {
                      setPoisonReverse(e.target.checked);
                      if (e.target.checked && cableCut) {
                        setBobMetric(16);
                        setBobNextHop('Unreachable (∞)');
                        setCharlieMetric(16);
                        setCharlieNextHop('Unreachable (∞)');
                      }
                    }}
                    className="accent-white cursor-pointer"
                  />
                  <span>Poison Reverse (&quot;Donuts are a lie&quot;)</span>
                </label>

                {/* Sabotage / Step Buttons */}
                {!cableCut ? (
                  <button
                    onClick={handleCutCable}
                    className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] font-extrabold bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Cut Alice&apos;s Cable / Steal Donuts
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleNextGossip}
                      disabled={bobMetric >= 16 && charlieMetric >= 16}
                      className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] font-extrabold bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    >
                      <span>🗣️ Gossip Next</span>
                      <span className="px-1.5 py-0.2 rounded bg-black text-white text-[10px]">
                        Cost: {Math.max(bobMetric, charlieMetric)}
                      </span>
                    </button>

                    <button
                      onClick={handleResetBellman}
                      className="px-3.5 py-2 rounded-xl text-xs font-['JetBrains_Mono'] border border-white/20 text-zinc-400 hover:text-white hover:border-white/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 3-Node Topology Diagram: Alice <-> Bob <-> Charlie */}
            <div className="relative w-full py-8 sm:py-12 px-4 bg-black/60 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-around gap-6 select-none overflow-hidden">
              {/* NODE 1: Alice (Donuts Provider) */}
              <div className="flex flex-col items-center gap-3 w-44">
                <div
                  className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    cableCut
                      ? 'border-zinc-800 bg-zinc-950 text-zinc-600'
                      : 'border-white bg-zinc-900 text-white shadow-[0_0_25px_rgba(255,255,255,0.1)]'
                  }`}
                >
                  <span className="text-xl">🍩</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-tight">
                    Alice
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[9px] text-zinc-500">
                    {cableCut ? 'OFFLINE' : 'Donut Depot'}
                  </span>
                </div>

                <div className="text-center font-['JetBrains_Mono'] text-[11px] text-zinc-500">
                  Target Destination
                </div>
              </div>

              {/* LINK: Alice <-> Bob */}
              <div className="flex-1 flex flex-col items-center px-4 w-full md:w-auto">
                <div
                  className={`w-full h-1 relative transition-all ${
                    cableCut ? 'border-t-2 border-dashed border-zinc-800' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                  }`}
                />
                <div className="mt-2 font-['JetBrains_Mono'] text-xs font-bold">
                  {cableCut ? (
                    <span className="text-white px-2 py-0.5 rounded bg-zinc-900 border border-white/20">
                      ✂️ CABLE SEVERED
                    </span>
                  ) : (
                    <span className="text-zinc-400">c(Alice, Bob) = 1</span>
                  )}
                </div>
              </div>

              {/* NODE 2: Bob (Adjacent Router) */}
              <div className="flex flex-col items-center gap-3 w-48">
                <div className="w-20 h-20 rounded-2xl border border-white bg-zinc-900 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white">
                    [Bob]
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[9px] text-zinc-400">
                    Router 01
                  </span>
                </div>

                {/* Bob's Routing Table Card */}
                <div className="w-full bg-zinc-950/90 border border-white/10 rounded-xl p-2.5 text-center font-['JetBrains_Mono'] text-[11px]">
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-1">
                    Bob&apos;s Routing Table
                  </div>
                  <div className="text-white font-bold">
                    To Alice:{' '}
                    <span className={bobMetric >= 16 ? 'text-zinc-400' : 'text-white'}>
                      {bobMetric >= 16 ? '∞ (16)' : `${bobMetric} hop${bobMetric > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">
                    Next-Hop: <strong className="text-white">{bobNextHop}</strong>
                  </div>
                </div>
              </div>

              {/* LINK: Bob <-> Charlie */}
              <div className="flex-1 flex flex-col items-center px-4 w-full md:w-auto">
                <div className="w-full h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <div className="mt-2 font-['JetBrains_Mono'] text-xs font-bold text-zinc-400">
                  c(Bob, Charlie) = 1
                </div>
              </div>

              {/* NODE 3: Charlie (Distant Router) */}
              <div className="flex flex-col items-center gap-3 w-48">
                <div className="w-20 h-20 rounded-2xl border border-white bg-zinc-900 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white">
                    [Charlie]
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[9px] text-zinc-400">
                    Router 02
                  </span>
                </div>

                {/* Charlie's Routing Table Card */}
                <div className="w-full bg-zinc-950/90 border border-white/10 rounded-xl p-2.5 text-center font-['JetBrains_Mono'] text-[11px]">
                  <div className="text-zinc-500 text-[9px] uppercase tracking-wider mb-1">
                    Charlie&apos;s Routing Table
                  </div>
                  <div className="text-white font-bold">
                    To Alice:{' '}
                    <span className={charlieMetric >= 16 ? 'text-zinc-400' : 'text-white'}>
                      {charlieMetric >= 16
                        ? '∞ (16)'
                        : `${charlieMetric} hop${charlieMetric > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[10px] mt-0.5">
                    Next-Hop: <strong className="text-white">{charlieNextHop}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Escalation Badge */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090a0f] border border-white/10">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider ${
                    getStatusBadge().color
                  }`}
                >
                  {getStatusBadge().label}
                </span>
                <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                  METRIC:{' '}
                  <strong className="text-white font-bold font-mono">
                    {Math.max(bobMetric, charlieMetric) >= 16
                      ? '∞ (Infinity reached)'
                      : Math.max(bobMetric, charlieMetric)}
                  </strong>
                </span>
              </div>
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-200 italic max-w-xl text-right">
                &ldquo;{gossipStatus}&rdquo;
              </span>
            </div>

            {/* Bottom 2-Column: Bellman-Ford Formula & Rumor Log */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Formula Card */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider mb-2">
                    <Terminal className="w-3.5 h-3.5 text-white" />
                    Bellman-Ford Dynamic Programming Equation
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-center font-['JetBrains_Mono'] text-xs sm:text-sm text-white font-bold mb-2">
                    D_x(y) = min_v &#123; c(x, v) + D_v(y) &#125;
                  </div>
                  <p className="font-['Geist'] text-xs text-zinc-400 leading-relaxed">
                    Distance-Vector routes entirely by rumor. Because routers possess no global topology map, they trust their neighbor&apos;s advertised distances blindly, sparking ping-pong loops when paths collapse.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
                  RFC 2453 COUNTERMEASURE: SPLIT HORIZON &amp; POISON REVERSE
                </div>
              </div>

              {/* Rumor Telephone Event Stream */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    Broken Telephone Propagation Stream
                  </div>
                  <div className="space-y-1.5 font-['JetBrains_Mono'] text-[11px] text-zinc-300">
                    {gossipLog.map((log, i) => (
                      <div key={i} className="truncate border-l border-white/20 pl-2">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 font-['JetBrains_Mono'] text-[10px] text-zinc-500">
                  ROUTING LOOP CYCLE: 2-NODE MUTUAL RECURSION
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

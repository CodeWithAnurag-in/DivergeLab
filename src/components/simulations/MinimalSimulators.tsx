"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function MinimalSimulators() {
  const [activeTab, setActiveTab] = useState<"dijkstra" | "bellman">("dijkstra");

  // --- SIM 1: Lazy Packet GPS (Dijkstra) State ---
  const [coffeeSpilled, setCoffeeSpilled] = useState(false);
  const [isPacketMoving, setIsPacketMoving] = useState(false);
  const [dijkstraStatus, setDijkstraStatus] = useState("Packet resting. Zero energy wasted.");

  const sendPacket = () => {
    setIsPacketMoving(true);
    setDijkstraStatus(
      coffeeSpilled
        ? "Recalculating... Avoiding the coffee spill! +12ms dread."
        : "Cruising along the optimal low-latency route."
    );
    setTimeout(() => {
      setIsPacketMoving(false);
      setDijkstraStatus("Packet delivered. Ready for a nap.");
    }, 1800);
  };

  // --- SIM 2: The Rumor Mill (Bellman-Ford Loop) State ---
  const [cableCut, setCableCut] = useState(false);
  const [splitHorizon, setSplitHorizon] = useState(false);
  const [metric, setMetric] = useState(2);
  const [gossipStatus, setGossipStatus] = useState("All good. Charlie trusts Bob, Bob sees Alice.");

  const cutCable = () => {
    setCableCut(true);
    if (splitHorizon) {
      setMetric(16);
      setGossipStatus("Split Horizon active: Charlie stays quiet. Route marked unreachable (∞).");
    } else {
      setMetric(3);
      setGossipStatus("Bob: 'Alice is gone, but Charlie told me he knows a way!' (Rumor starts)");
    }
  };

  const nextGossip = () => {
    if (!cableCut) return;
    if (metric >= 16) {
      setGossipStatus("RIP Limit 16 reached! Loop terminated. Office sanity restored.");
      return;
    }
    const nextVal = metric + 1;
    setMetric(nextVal);
    if (nextVal % 2 === 0) {
      setGossipStatus(`Charlie to Bob: 'Wait, now my cost is ${nextVal}!'`);
    } else {
      setGossipStatus(`Bob to Charlie: 'Nevermind, mine is now ${nextVal}!'`);
    }
  };

  const resetBellman = () => {
    setCableCut(false);
    setMetric(2);
    setGossipStatus("All good. Charlie trusts Bob, Bob sees Alice.");
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="inline-block px-2 py-0.5 mb-2 bg-white/5 border border-white/10 rounded font-['JetBrains_Mono'] text-[10px] text-zinc-400 tracking-widest uppercase">
          [05] INTERACTIVE LABS
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl lg:text-3xl text-white tracking-tight">
          Visual Routing Mechanics
        </h2>
        <p className="font-['Geist'] text-zinc-400 text-sm mt-1">
          Two clean, lightweight visualizers. Test shortest-path adaptation and routing-by-rumor loops.
        </p>
      </div>

      {/* Simulator Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("dijkstra")}
          className={`px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === "dijkstra"
              ? "bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]"
              : "bg-zinc-950/80 text-zinc-400 border-white/10 hover:text-white"
          }`}
        >
          01 // The Lazy Packet (Dijkstra)
        </button>
        <button
          onClick={() => setActiveTab("bellman")}
          className={`px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === "bellman"
              ? "bg-white text-black border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]"
              : "bg-zinc-950/80 text-zinc-400 border-white/10 hover:text-white"
          }`}
        >
          02 // The Rumor Loop (Bellman-Ford)
        </button>
      </div>

      {/* Canvas Card */}
      <div className="w-full rounded-2xl bg-zinc-950/80 border border-white/10 p-6 backdrop-blur-xl relative overflow-hidden">
        {/* ================= SIMULATOR 1 ================= */}
        {activeTab === "dijkstra" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                GOAL: Deliver packet from <strong className="text-white">SRC [A]</strong> to{" "}
                <strong className="text-white">DEST [D]</strong> with minimum cost.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCoffeeSpilled(!coffeeSpilled)}
                  className={`px-3 py-1.5 rounded text-xs font-['JetBrains_Mono'] border transition-colors cursor-pointer ${
                    coffeeSpilled
                      ? "bg-white text-black border-white font-bold"
                      : "border-white/20 text-zinc-300 hover:border-white/40"
                  }`}
                >
                  {coffeeSpilled ? "☕ Coffee Cleaned" : "☕ Spill Coffee on Link B-D"}
                </button>
                <button
                  onClick={sendPacket}
                  disabled={isPacketMoving}
                  className="px-4 py-1.5 rounded text-xs font-['JetBrains_Mono'] font-bold bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  {isPacketMoving ? "Transmitting..." : "Send Packet"}
                </button>
              </div>
            </div>

            {/* Topology SVG */}
            <div className="relative w-full h-48 flex items-center justify-center">
              <svg className="w-full max-w-lg h-full" viewBox="0 0 500 160">
                {/* Links */}
                <line x1="80" y1="80" x2="250" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <line x1="80" y1="80" x2="250" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <line
                  x1="250"
                  y1="35"
                  x2="420"
                  y2="80"
                  stroke={coffeeSpilled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}
                  strokeWidth="1.5"
                  strokeDasharray={coffeeSpilled ? "4 4" : "0"}
                />
                <line x1="250" y1="125" x2="420" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                {/* Highlighted active path */}
                {coffeeSpilled ? (
                  <path d="M 80 80 L 250 125 L 420 80" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                ) : (
                  <path d="M 80 80 L 250 35 L 420 80" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                )}

                {/* Cost Badges */}
                <text x="155" y="45" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">
                  2ms
                </text>
                <text x="155" y="115" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">
                  5ms
                </text>
                <text
                  x="340"
                  y="45"
                  fill={coffeeSpilled ? "#71717a" : "#a1a1aa"}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {coffeeSpilled ? "99ms (Hot Spill!)" : "2ms"}
                </text>
                <text x="340" y="115" fill="#a1a1aa" fontSize="10" fontFamily="JetBrains Mono">
                  2ms
                </text>

                {/* Nodes */}
                {[
                  { x: 80, y: 80, label: "A (Src)" },
                  { x: 250, y: 35, label: "B" },
                  { x: 250, y: 125, label: "C" },
                  { x: 420, y: 80, label: "D (Dest)" },
                ].map((n, i) => (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r="16" fill="#09090b" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={n.x}
                      y={n.y + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {n.label}
                    </text>
                  </g>
                ))}

                {/* Animated Packet Dot */}
                {isPacketMoving && (
                  <motion.circle
                    r="5"
                    fill="#ffffff"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 1.6, ease: "easeInOut" }}
                    style={{
                      offsetPath: coffeeSpilled
                        ? "path('M 80 80 L 250 125 L 420 80')"
                        : "path('M 80 80 L 250 35 L 420 80')",
                    }}
                  />
                )}
              </svg>
            </div>

            {/* Minimal Witty Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                ACTIVE PATH:{" "}
                <span className="text-white font-bold">
                  {coffeeSpilled ? "A ➔ C ➔ D (7ms)" : "A ➔ B ➔ D (4ms)"}
                </span>
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-white">
                "{dijkstraStatus}"
              </span>
            </div>
          </div>
        )}

        {/* ================= SIMULATOR 2 ================= */}
        {activeTab === "bellman" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                COUNT-TO-INFINITY: Observe how bad news travels slowly in distance-vector routing.
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-['JetBrains_Mono'] text-zinc-300">
                  <input
                    type="checkbox"
                    checked={splitHorizon}
                    onChange={(e) => setSplitHorizon(e.target.checked)}
                    className="accent-white cursor-pointer"
                  />
                  Split Horizon
                </label>
                {!cableCut ? (
                  <button
                    onClick={cutCable}
                    className="px-3 py-1.5 rounded text-xs font-['JetBrains_Mono'] bg-white text-black font-bold hover:bg-zinc-200 transition-colors cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                  >
                    ✂️ Sever Link A—B
                  </button>
                ) : (
                  <>
                    <button
                      onClick={nextGossip}
                      disabled={metric >= 16}
                      className="px-3 py-1.5 rounded text-xs font-['JetBrains_Mono'] border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      🗣️ Gossip Next ({metric})
                    </button>
                    <button
                      onClick={resetBellman}
                      className="px-3 py-1.5 rounded text-xs font-['JetBrains_Mono'] text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 3-Node Topology */}
            <div className="flex items-center justify-around py-6 max-w-lg mx-auto w-full relative">
              {/* Router A */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full border flex items-center justify-center font-['JetBrains_Mono'] font-bold text-xs ${
                    cableCut
                      ? "border-zinc-700 text-zinc-600 bg-zinc-950"
                      : "border-white text-white bg-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.06)]"
                  }`}
                >
                  [A]
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500">Destination</span>
              </div>

              {/* Link A-B */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div
                  className={`w-full h-0.5 ${
                    cableCut ? "border-t border-dashed border-zinc-700" : "bg-white"
                  }`}
                />
                <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500 mt-1">
                  {cableCut ? "❌ CUT" : "cost: 1"}
                </span>
              </div>

              {/* Router B */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-white flex items-center justify-center font-['JetBrains_Mono'] font-bold text-xs bg-zinc-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]">
                  [B]
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400">
                  Cost to A: {cableCut ? (metric % 2 !== 0 ? metric : metric - 1) : 1}
                </span>
              </div>

              {/* Link B-C */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full h-0.5 bg-white" />
                <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500 mt-1">cost: 1</span>
              </div>

              {/* Router C */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-white flex items-center justify-center font-['JetBrains_Mono'] font-bold text-xs bg-zinc-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]">
                  [C]
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-400">
                  Cost to A: {cableCut ? (metric % 2 === 0 ? metric : metric - 1) : 2}
                </span>
              </div>
            </div>

            {/* Minimal Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <span className="font-['JetBrains_Mono'] text-xs text-zinc-400">
                METRIC:{" "}
                <span className="text-white font-bold">
                  {metric >= 16 ? "∞ (Infinity reached)" : metric}
                </span>
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-white">
                "{gossipStatus}"
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

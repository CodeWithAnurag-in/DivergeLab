import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Network, Cpu, ShieldCheck, Zap } from 'lucide-react';

export const RoutingMeshBridge: React.FC = () => {
  return (
    <section className="relative z-10 w-full bg-black border-t border-white/10 pt-16 pb-20 px-4 sm:px-8 overflow-hidden">

      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10 pointer-events-none">
        {/* Transition Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/15 mb-4 pointer-events-auto"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="font-['JetBrains_Mono'] text-[11px] text-zinc-300 tracking-wider uppercase">
              LAYER 3 TRANSITION // INGRESS TO CONTROL PLANE
            </span>
          </motion.div>

          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl text-white tracking-tight uppercase max-w-4xl">
            From Encapsulated Slabs to Distributed Mesh.
          </h2>
          <p className="font-['Geist'] text-zinc-400 text-base sm:text-lg max-w-2xl mt-4">
            Having traversed the physical wire (802.3 Frame) to the IPv4 Network Layer, packet forwarding ceases to be a static header—it becomes a dynamic computation across an autonomous mesh.
          </p>
        </div>

        {/* HUD Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-16 pointer-events-auto">
          <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-1">
              <span>Domain Architecture</span>
              <Network className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">AS-65001</div>
            <div className="text-[11px] text-zinc-500 font-['Geist'] mt-0.5">Dual-Homed Transit Core</div>
          </div>

          <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-1">
              <span>Active Topology</span>
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">6 Routers • 8 Links</div>
            <div className="text-[11px] text-zinc-500 font-['Geist'] mt-0.5">Bi-directional weighted mesh</div>
          </div>

          <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-1">
              <span>Protocols Tested</span>
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">OSPF vs RIPv2</div>
            <div className="text-[11px] text-zinc-500 font-['Geist'] mt-0.5">Dijkstra SPF vs Bellman-Ford</div>
          </div>

          <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest mb-1">
              <span>State Integrity</span>
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-['JetBrains_Mono'] text-lg font-bold text-white">Deterministic</div>
            <div className="text-[11px] text-zinc-500 font-['Geist'] mt-0.5">Zero static mockups • Live RIB/FIB</div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex items-center justify-center gap-2 text-zinc-500 font-['JetBrains_Mono'] text-xs tracking-wider uppercase pointer-events-auto">
          <span>Explore Architectural Divergence</span>
          <ArrowDown className="w-3.5 h-3.5 text-zinc-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default RoutingMeshBridge;

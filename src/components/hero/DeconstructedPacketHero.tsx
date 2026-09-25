import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'motion/react';

interface SlabProps {
  label: string;
  title: string;
  fields: string[];
  y: MotionValue<number>;
  z: MotionValue<number>;
  rotateX: MotionValue<number>;
  opacity: MotionValue<number>;
  isCore?: boolean;
}

/**
 * LayerSlab represents a single OSI layer in the deconstructed packet view.
 */
const LayerSlab: React.FC<SlabProps> = ({ label, title, fields, y, z, rotateX, opacity, isCore }) => {
  return (
    <motion.div
      style={{
        y,
        z,
        rotateX,
        opacity,
      }}
      className={`absolute w-full h-full flex flex-col p-4 rounded-xl transition-colors duration-300
        transform-gpu will-change-transform [backface-visibility:hidden]
        ${isCore ? 'bg-zinc-900 border-white/40 shadow-xl' : 'bg-zinc-950 border-white/15'}
        border`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-tighter">
          {label}
        </span>
        <div className="flex gap-1">
          <div className={`w-1 h-1 rounded-full ${isCore ? 'bg-white' : 'bg-zinc-700'}`} />
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
        </div>
      </div>
      
      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-white mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2 mt-auto">
        {fields.map((field, i) => (
          <div 
            key={i} 
            className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 flex items-center"
          >
            <span className="font-['JetBrains_Mono'] text-[8px] text-zinc-400 whitespace-nowrap">
              {field}
            </span>
          </div>
        ))}
      </div>
      {isCore && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
          <div className="font-['JetBrains_Mono'] text-[10px] text-white leading-tight break-all p-4">
            {Array(5).fill("0100 1101 0110 0101 0111 0010 0110 0111 0110 0101").join(" ")}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * DeconstructedPacketHero is a scroll-driven technical hero section.
 * It visualizes a network packet deconstructing as the user scrolls,
 * powered by the SonarGrid interactive radar dot field as its visual foundation.
 */
export default function DeconstructedPacketHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Smooth out the scroll input with non-oscillating friction
  const scrollSpring = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.2, // Low mass eliminates trailing inertia lag
    restDelta: 0.002
  });

  // Animation values for headers - fades early so focus is purely on the 3D slabs
  const headerOpacity = useTransform(scrollSpring, [0, 0.08, 0.28, 0.38], [1, 1, 1, 0]);
  const headerY = useTransform(scrollSpring, [0, 0.1, 0.28, 0.38], [0, 0, 0, -20]);

  // Transform phases for the slabs - stay fully unfolded across the entire hero scroll!
  // ONLY close back when the hero is almost completely scrolled off the screen (~0.85 -> 0.95)
  const rotateX = useTransform(scrollSpring, [0, 0.15, 0.85, 0.95, 1.0], [0, 25, 25, 0, 0]);
  const globalOpacity = useTransform(scrollSpring, [0, 0.04, 0.96, 1.0], [0.85, 1, 1, 1]);
  const scrollCueOpacity = useTransform(scrollSpring, [0, 0.05], [1, 0]);

  // Layer 1: Data Link (Upward/Forward)
  const l1Y = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, -110, -110, 0, 0]);
  const l1Z = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, 90, 90, 0, 0]);

  // Layer 2: Network (Slightly Up)
  const l2Y = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, -35, -35, 0, 0]);
  const l2Z = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, 35, 35, 0, 0]);

  // Layer 3: Transport (Slightly Down)
  const l3Y = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, 35, 35, 0, 0]);
  const l3Z = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, -35, -35, 0, 0]);

  // Layer 4: Payload (Downward/Backward)
  const l4Y = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, 110, 110, 0, 0]);
  const l4Z = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95, 1.0], [0, -90, -90, 0, 0]);

  // Connector line dash offset animation
  const dashOffset = useTransform(scrollSpring, [0.08, 0.2, 0.85, 0.95], [1000, 0, 0, 1000]);
  const connectorOpacity = useTransform(scrollSpring, [0.1, 0.2, 0.85, 0.92], [0, 1, 1, 0]);

  // Telemetry badge values
  const telemetryOpacity = useTransform(scrollSpring, [0.15, 0.25, 0.95, 1.0], [0, 1, 1, 1]);
  const statusLabel = useTransform(scrollSpring, [0, 0.12, 0.85], ["INIT_SESSION", "DECONSTRUCT_VIEW", "ENCAPSULATION VERIFIED"]);

  return (
    <div ref={containerRef} className="relative h-[160vh] w-full bg-black font-['Geist'] isolate" style={{ backgroundColor: "#000000" }}>
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 bg-black" style={{ backgroundColor: "#000000" }}>
        
        {/* Background Radial Depth Gradient Accent */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] opacity-30 z-0" />
        
        {/* Header Text */}
        <motion.div 
          style={{ opacity: headerOpacity, y: headerY }}
          className="relative z-20 text-center mb-16 pointer-events-none select-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-300 tracking-widest uppercase">
              PACKET TELEMETRY ACTIVE • SCROLL TO EXPLORE
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] font-bold text-4xl sm:text-6xl text-white tracking-tighter mb-4">
            Full-Stack Encapsulation.
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto">
            Anatomy of a packet traversing the OSI model layers.
          </p>
        </motion.div>

        {/* 3D Perspective Assembly */}
        <motion.div 
          style={{ opacity: globalOpacity, transformStyle: 'preserve-3d', willChange: 'transform' }}
          className="relative z-10 w-80 sm:w-96 h-48 flex items-center justify-center [perspective:1000px]"
        >
          {/* Connector Lines (SVG) */}
          <motion.svg 
            style={{ opacity: connectorOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            viewBox="0 0 400 200"
          >
            {/* Top-Down Connectors */}
            <motion.path
              d="M 50,0 L 50,200 M 350,0 L 350,200"
              stroke="white"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              style={{ strokeDashoffset: dashOffset }}
              fill="none"
              className="opacity-20"
            />
          </motion.svg>

          {/* Slabs */}
          <LayerSlab 
            label="L2 • Data Link" 
            title="802.3 Frame" 
            fields={["SRC MAC", "DEST MAC", "FCS"]} 
            y={l1Y} z={l1Z} rotateX={rotateX} opacity={globalOpacity}
          />
          <LayerSlab 
            label="L3 • Network" 
            title="IPv4 Packet" 
            fields={["TTL", "CHKSUM", "SRC IP", "DEST IP"]} 
            y={l2Y} z={l2Z} rotateX={rotateX} opacity={globalOpacity}
          />
          <LayerSlab 
            label="L4 • Transport" 
            title="TCP Segment" 
            fields={["PORT 443", "SEQ", "ACK", "WINDOW"]} 
            y={l3Y} z={l3Z} rotateX={rotateX} opacity={globalOpacity}
          />
          <LayerSlab 
            label="L7 • Application" 
            title="Raw Payload" 
            fields={["TLSv1.3", "HEX BUFFER"]} 
            y={l4Y} z={l4Z} rotateX={rotateX} opacity={globalOpacity}
            isCore
          />

          {/* Telemetry HUD Elements */}
          <motion.div
            style={{ opacity: connectorOpacity }}
            className="absolute -right-40 md:-right-48 lg:-right-60 xl:-right-72 top-2 hidden lg:flex flex-col gap-5 text-left pointer-events-none z-30"
          >
            <div className="border-l-2 border-white/30 pl-3.5 backdrop-blur-sm py-0.5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Latency</p>
              <p className="font-['JetBrains_Mono'] text-xs text-white font-semibold">0.042ms</p>
            </div>
            <div className="border-l-2 border-white/30 pl-3.5 backdrop-blur-sm py-0.5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol</p>
              <p className="font-['JetBrains_Mono'] text-xs text-white font-semibold">FRAME-HTTPS</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Initial Scroll Cue Beacon */}
        <motion.div
          style={{ opacity: scrollCueOpacity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/90 border border-white/15 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest text-zinc-300">
              Scroll to Deconstruct Packet
            </span>
          </div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-white" />
          </motion.div>
        </motion.div>

        {/* Bottom Status Bar */}
        <motion.div 
          style={{ opacity: telemetryOpacity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-6 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-[1px] bg-white/10" />
            <div className="flex justify-between w-full items-center">
              <motion.span className="font-['JetBrains_Mono'] text-[10px] text-white tracking-widest uppercase">
                {statusLabel}
              </motion.span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-zinc-500 uppercase tracking-widest">
                1500 BYTES MTU
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

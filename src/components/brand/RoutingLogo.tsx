import somaiyaLogo from "@/assets/somaiya-logo.png";

export default function RoutingLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-full bg-white p-0.5 shadow-[0_0_12px_rgba(255,255,255,0.2)] ring-1 ring-white/20 overflow-hidden ${className}`}
    >
      <img
        src={somaiyaLogo}
        alt="Somaiya Vidyavihar Logo"
        className="w-full h-full object-contain"
        loading="eager"
      />
    </div>
  );
}

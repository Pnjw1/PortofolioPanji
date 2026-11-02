import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Efek Petir Nyala Redup (Pulsing Glow) */}
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur-[30px] animate-pulse opacity-50"></div>
          <Zap 
            size={48} 
            className="text-cyan-400 relative z-10 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" 
            fill="currentColor"
          />
        </div>
        
        {/* Teks Loading dengan Animasi Titik */}
        <div className="text-cyan-400 font-mono font-bold tracking-widest flex items-center">
          MEMUAT
          <span className="animate-[bounce_1s_infinite_100ms]">.</span>
          <span className="animate-[bounce_1s_infinite_200ms]">.</span>
          <span className="animate-[bounce_1s_infinite_300ms]">.</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8854a] to-[#c96f3a] shadow-md shadow-[#e8854a]/20">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.04] px-5 py-3.5">
          <span className="typing-dot h-2 w-2 rounded-full bg-[#e8854a]/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#e8854a]/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#e8854a]/60" />
        </div>
      </div>
    </div>
  );
}

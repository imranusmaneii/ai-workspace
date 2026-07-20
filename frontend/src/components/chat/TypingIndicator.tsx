"use client";

import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-md shadow-[#dc2626]/20">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.04] px-5 py-3.5">
          <span className="typing-dot h-2 w-2 rounded-full bg-[#dc2626]/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#dc2626]/60" />
          <span className="typing-dot h-2 w-2 rounded-full bg-[#dc2626]/60" />
        </div>
      </div>
    </div>
  );
}

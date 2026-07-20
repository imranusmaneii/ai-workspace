"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const suggestions = [
  { icon: "Build", label: "Build" },
  { icon: "Code", label: "Code" },
  { icon: "Explain", label: "Explain" },
  { icon: "Research", label: "Research" },
  { icon: "Debug", label: "Debug" },
  { icon: "Write", label: "Write" },
  { icon: "Learn", label: "Learn" },
  { icon: "Plan", label: "Plan" },
];

export default function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleSuggestionClick = (label: string) => {
    const prompt = `${label} `;
    setInput(prompt);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass rounded-2xl transition-all duration-200 focus-within:border-white/10 shadow-lg shadow-black/20">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(e.target); }}
            onKeyDown={handleKeyDown}
            placeholder="Message Noir AI..."
            rows={1}
            className="w-full resize-none bg-transparent px-5 py-4 pr-14 text-[15px] outline-none placeholder:text-muted-foreground/40 min-h-[56px] max-h-[160px]"
          />
          <div className="absolute right-3 bottom-3">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-all text-foreground"
                title="Stop generating"
              >
                <div className="h-3.5 w-3.5 rounded-sm bg-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-md shadow-[#dc2626]/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>

      {!isLoading && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 px-4">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSuggestionClick(s.label)}
              className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] hover:border-white/10 transition-all duration-150"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

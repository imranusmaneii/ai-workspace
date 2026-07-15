"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Copy, Check, RotateCcw, User } from "lucide-react";
import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: () => void;
}

export default function ChatMessage({ message, isLast, onRegenerate }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const copyCode = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, []);

  const copyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  }, [message.content]);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const isError = isAssistant && message.content.startsWith("Error:");

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="rounded-2xl bg-gradient-to-r from-[#e8854a]/10 to-[#c96f3a]/10 border border-[#e8854a]/10 px-5 py-3">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8854a]/15 mt-0.5">
            <User size={14} className="text-[#e8854a]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-slide-up">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e8854a] to-[#c96f3a] mt-0.5 shadow-md shadow-[#e8854a]/20">
          <span className="text-xs font-bold text-white">N</span>
        </div>

        <div className="flex-1 min-w-0">
          {isError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4">
              <p className="text-sm text-red-400">{message.content}</p>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="mt-3 flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  <RotateCcw size={12} />
                  Try again
                </button>
              )}
            </div>
          ) : (
            <div className="markdown-content text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: any }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    if (match) {
                      const lang = match[1];
                      return (
                        <div className="relative my-3 group">
                          <div className="flex items-center justify-between rounded-t-xl bg-[#1a1a1a] border border-white/5 border-b-0 px-4 py-2">
                            <span className="text-[11px] text-muted-foreground/60 font-mono uppercase tracking-wider">{lang}</span>
                            <button
                              onClick={() => copyCode(codeStr)}
                              className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              {copiedCode ? <Check size={11} /> : <Copy size={11} />}
                              {copiedCode ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={lang}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderTopLeftRadius: 0,
                              borderTopRightRadius: 0,
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderTop: "none",
                              background: "#141414",
                              fontSize: "13px",
                              lineHeight: "1.6",
                            }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="rounded-md bg-white/5 px-1.5 py-0.5 text-[13px] text-[#e8854a] font-mono" {...props}>
                        {codeStr}
                      </code>
                    );
                  },
                  table({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-lg border border-white/5">
                        <table className="w-full text-sm">{children}</table>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {isAssistant && !isError && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyMessage}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {copiedMsg ? <Check size={11} /> : <Copy size={11} />}
                {copiedMsg ? "Copied" : "Copy"}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <RotateCcw size={11} />
                  Regenerate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

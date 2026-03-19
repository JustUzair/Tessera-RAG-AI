"use client";
import { motion } from "framer-motion";
import { TesseraLogo } from "@/components/layout/TesseraLogo";
import type { ChatMessage as ChatMessageType } from "@/types";
import { CitationBadge } from "./CitationBadge";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20
                        flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <TesseraLogo className="w-4 h-4 text-accent" />
        </div>
      )}

      <div
        className={`max-w-2xl flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-accent text-bg font-medium rounded-br-sm"
              : "bg-surface border border-border text-foreground rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-0.5">
            {message.citations.map((c, i) => (
              <CitationBadge
                key={`${c.source}-${c.chunkId}-${i}`}
                citation={c}
              />
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-xl bg-surface border border-border
                        flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <span className="text-[11px] font-bold text-muted">YOU</span>
        </div>
      )}
    </motion.div>
  );
}

"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronUp } from "lucide-react";
import { TesseraLogo } from "@/components/layout/TesseraLogo";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/types";

interface Props {
  messages: ChatMessageType[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MessageList({
  messages,
  isLoading,
  isLoadingHistory,
  hasMore,
  onLoadMore,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages only
  // (not when old messages are prepended at the top)
  const prevLengthRef = useRef(0);
  useEffect(() => {
    const prev = prevLengthRef.current;
    const curr = messages.length;

    // Only scroll if messages were appended (not prepended via load more)
    // Heuristic: if the first new message is at the end, it's an append
    if (curr > prev) {
      const lastMsg = messages[curr - 1];
      if (
        lastMsg &&
        (lastMsg.role === "user" || lastMsg.role === "assistant")
      ) {
        // Only auto-scroll for real-time messages, not history loads
        // Real-time = last message is very recent (within 2s)
        const isRecent = Date.now() - lastMsg.ts.getTime() < 2000;
        if (isRecent) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    prevLengthRef.current = curr;
  }, [messages]);

  // When loading state finishes (thinking dots disappear), scroll to bottom
  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  if (messages.length === 0 && !isLoading && !isLoadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-5 max-w-xs"
        >
          <div
            className="w-16 h-16 rounded-2xl bg-surface border border-border
                          flex items-center justify-center mx-auto"
          >
            <TesseraLogo className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              Ask Tessera anything
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Upload documents in the sidebar, select a namespace, then ask
              questions about your knowledge base.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Load more / history loader ─────────────────── */}
        <AnimatePresence>
          {(hasMore || isLoadingHistory) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-center pb-2"
            >
              {isLoadingHistory ? (
                <div className="flex items-center gap-2 text-xs text-muted px-4 py-2">
                  <Loader2 size={13} className="animate-spin" />
                  Loading history…
                </div>
              ) : (
                <button
                  onClick={onLoadMore}
                  className="flex items-center gap-1.5 text-xs text-muted
                             hover:text-foreground transition-colors duration-150
                             px-4 py-2 rounded-full border border-border
                             hover:border-accent/30 bg-surface hover:bg-surface-2"
                >
                  <ChevronUp size={13} />
                  Load older messages
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages ──────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* ── Thinking indicator ────────────────────────── */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-3"
          >
            <div
              className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20
                            flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <TesseraLogo className="w-4 h-4 text-accent" />
            </div>
            <div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm
                            bg-surface border border-border"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.22,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

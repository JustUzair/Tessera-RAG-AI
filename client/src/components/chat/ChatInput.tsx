"use client";
import { useState, useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface Props {
  onSend: (msg: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function handleSend() {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="border-t border-border bg-bg px-4 py-4 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative flex items-end gap-3 p-3 rounded-2xl
                        border border-border bg-surface
                        focus-within:border-accent/40 transition-colors duration-200"
        >
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={e => {
              setValue(e.target.value);
              autoResize();
            }}
            onKeyDown={onKeyDown}
            placeholder="Ask about your documents…"
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-foreground
                       placeholder:text-muted outline-none leading-relaxed
                       max-h-[200px] overflow-y-auto disabled:opacity-50"
          />

          <motion.button
            onClick={handleSend}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.06 } : {}}
            whileTap={canSend ? { scale: 0.94 } : {}}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                        transition-colors duration-200 ${
                          canSend
                            ? "bg-accent text-bg hover:bg-accent/90"
                            : "bg-surface-2 text-muted cursor-not-allowed"
                        }`}
          >
            <ArrowUp size={17} />
          </motion.button>
        </div>

        <p className="text-center text-[11px] text-muted mt-2">
          <kbd className="opacity-60">Shift+Enter</kbd> for new line ·{" "}
          <kbd className="opacity-60">Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}

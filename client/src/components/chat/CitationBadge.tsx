"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Citation } from "@/types";

export function CitationBadge({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs
                   bg-accent/10 text-accent border border-accent/25
                   hover:bg-accent/20 transition-colors duration-150"
      >
        <span className="truncate max-w-[110px] font-medium">
          {citation.source}
        </span>
        <span className="text-accent/50 font-mono">#{citation.chunkId}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute bottom-full left-0 mb-2 w-72 z-20
                       p-3.5 rounded-xl bg-surface-2 border border-border
                       shadow-xl text-xs leading-relaxed"
          >
            <p className="font-semibold text-foreground font-display mb-1.5">
              {citation.source}
              <span className="text-muted font-normal ml-1">
                {">"} chunk {citation.chunkId}
              </span>
            </p>
            <p className="text-muted line-clamp-5">
              {citation.readablePreview || citation.preview}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

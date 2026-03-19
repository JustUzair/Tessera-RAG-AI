"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-32 px-6 md:px-10">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative p-12 md:p-16 rounded-3xl border border-accent/20
                     bg-surface overflow-hidden text-center"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(212,168,75,0.14),transparent)]" />
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(circle_at_top_left,rgba(212,168,75,0.08),transparent)]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_right,rgba(212,168,75,0.06),transparent)]" />

          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Start building your mosaic
            </h2>
            <p className="text-muted text-lg max-w-md mx-auto">
              Upload your first document and see Tessera reassemble your
              knowledge into answers in seconds.
            </p>
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full
                           bg-accent text-bg font-semibold text-sm
                           hover:bg-accent/90 transition-colors
                           shadow-2xl shadow-accent/30 mt-2"
              >
                Open Tessera
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

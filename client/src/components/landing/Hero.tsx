"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Must be dynamic — Spline uses browser APIs
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

export default function SplineScene({ onLoad }: { onLoad?: () => void }) {
  return (
    <motion.div className="relative h-[480px] lg:h-[600px] w-full">
      <iframe
        src={process.env.NEXT_PUBLIC_SPLINE_URL}
        className="{make beautifications here}"
        width="100%"
        height="100%"
      ></iframe>

      {/* Covers the bottom-right watermark */}
      <div className="absolute bottom-2 right-0 w-40 h-12 bg-bg z-10 rounded-tl-lg dark:bg-black" />
    </motion.div>
  );
}
const WORDS = ["documents,", "assembled", "into", "answers."];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Background ──────────────────────────────────── */}
      <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(212,168,75,0.13),transparent_65%)]" />
      {/* Animated glow blobs */}
      <div className="absolute top-1/3 -left-1/4 w-[500px] aspect-square rounded-full bg-accent/5 blur-[120px] animate-float-a" />
      <div className="absolute bottom-0 -right-1/4 w-[400px] aspect-square rounded-full bg-accent/4 blur-[100px] animate-float-b" />

      {/* ── Content grid ────────────────────────────────── */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full
                      grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8
                      items-center py-36 lg:py-0 min-h-screen"
      >
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                       border border-accent/30 bg-accent/8 text-accent text-xs font-medium"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            RAG · Vector Search · Semantic Cache
          </motion.div>

          {/* Headline */}
          <h1
            className="font-display text-5xl md:text-6xl xl:text-7xl font-bold
                         tracking-tighter leading-[1.06] text-foreground"
          >
            Your{" "}
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.3 + i * 0.1,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={
                  word === "assembled"
                    ? "text-accent inline-block mr-2"
                    : "inline-block mr-[0.25em]"
                }
              >
                {word}{" "}
              </motion.span>
            ))}
          </h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="text-muted text-lg leading-relaxed max-w-md"
          >
            Tessera fragments your knowledge into searchable tesserae — then
            reassembles them into citation-backed answers when you need them.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-center gap-5"
          >
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                           bg-accent text-bg font-semibold text-sm
                           hover:bg-accent/90 transition-colors
                           shadow-xl shadow-accent/25"
              >
                Start building
                <ArrowRight size={15} />
              </motion.button>
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              See how it works →
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Spline 3D */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[480px] lg:h-[600px] w-full"
        >
          {/*
            Replace the scene URL below with your own Spline scene.
            Browse public scenes at: https://app.spline.design/community
            Recommended search: "abstract 3D", "geometric", "low poly sphere"
            Copy the "Public URL" from scene settings → Export → Viewer
          */}
          <SplineScene />
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-bg to-transparent" />
    </section>
  );
}

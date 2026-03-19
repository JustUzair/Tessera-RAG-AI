"use client";
import { motion, Variants } from "framer-motion";
import { SearchIcon, BookMarked, Layers2, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: SearchIcon,
    title: "Semantic search",
    description:
      "Vector embeddings find meaning, not just keywords. Ask naturally — get back the right chunks every time.",
  },
  {
    icon: BookMarked,
    title: "Cited answers",
    description:
      "Every response traces back to its source. Know the exact document and chunk behind each insight.",
  },
  {
    icon: Layers2,
    title: "Namespace isolation",
    description:
      "Separate knowledge bases for separate contexts. Projects, teams, topics — cleanly partitioned.",
  },
  {
    icon: Zap,
    title: "Semantic cache",
    description:
      "Near-identical queries hit the cache, not the LLM. Faster responses, lower costs, same accuracy.",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-18"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Built for precision
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Each piece engineered to fit. Like a mosaic — individually small,
            collectively sharp.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

type FeatureProps = (typeof FEATURES)[number];

function FeatureCard({ icon: Icon, title, description }: FeatureProps) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className="group relative p-6 rounded-2xl border border-border bg-surface
                 hover:border-accent/30 transition-colors duration-300 overflow-hidden"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-[radial-gradient(ellipse_at_top_left,rgba(212,168,75,0.07),transparent_65%)]"
      />

      <div className="relative z-10 space-y-4">
        <div
          className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20
                        flex items-center justify-center text-accent"
        >
          <Icon size={19} strokeWidth={1.75} />
        </div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

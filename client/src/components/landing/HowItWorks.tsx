"use client";
import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Upload your documents",
    body: "PDF, TXT, or Markdown. Assign a namespace to keep knowledge organized across projects.",
  },
  {
    n: "02",
    title: "Tessera chunks and embeds",
    body: "Files are split into overlapping tesserae and indexed into a vector store for semantic retrieval.",
  },
  {
    n: "03",
    title: "Ask, get cited answers",
    body: "Your question retrieves the most relevant chunks. The agent assembles a grounded, cited response.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 px-6 md:px-10 bg-surface border-y border-border"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            How Tessera works
          </h2>
          <p className="text-muted text-lg">
            From raw documents to grounded answers in three steps.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
          {/* Connector line (desktop) */}
          <div
            className="absolute top-7 left-[calc(16.6%)] right-[calc(16.6%)]
                          h-px bg-gradient-to-r from-accent/30 via-accent/60 to-accent/30
                          hidden md:block"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative text-center"
            >
              {/* Step circle */}
              <div
                className="relative inline-flex items-center justify-center
                              w-14 h-14 rounded-full
                              border-2 border-accent bg-bg mb-6
                              shadow-[0_0_24px_rgba(212,168,75,0.2)]"
              >
                <span className="font-display font-bold text-accent text-sm">
                  {step.n}
                </span>
              </div>

              <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

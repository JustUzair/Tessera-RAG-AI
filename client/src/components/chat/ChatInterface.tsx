"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen, PanelLeftClose, RotateCcw } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { TesseraLogo } from "@/components/layout/TesseraLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { KBPanel } from "./KBPanel";
import { useKB } from "@/hooks/useKB";

export function ChatInterface() {
  const [namespace, setNamespace] = useState("default");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    messages,
    isLoading,
    isLoadingHistory,
    hasMore,
    threadId,
    send,
    loadMore,
    clear,
  } = useChat(namespace);
  const kb = useKB();

  return (
    <div className="flex h-screen bg-bg text-foreground overflow-hidden">
      {/* ── Mobile backdrop ──────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="fixed md:relative left-0 top-0 bottom-0
                       w-[280px] z-30 md:z-auto
                       border-r border-border flex-shrink-0"
          >
            <KBPanel
              namespace={namespace}
              onNamespaceChange={setNamespace}
              kb={kb}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-muted hover:text-foreground
                       hover:bg-surface transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose size={17} />
            ) : (
              <PanelLeftOpen size={17} />
            )}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <TesseraLogo className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold text-sm text-foreground">
              Tessera
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Active namespace badge */}
            <span
              className="hidden sm:inline text-xs px-2.5 py-1 rounded-full
                             border border-border bg-surface text-muted"
            >
              {namespace}
            </span>

            {/* Thread ID (subtle) */}
            {threadId && (
              <span className="hidden lg:inline text-[10px] text-muted/50 font-mono truncate max-w-[80px]">
                {threadId.slice(0, 8)}
              </span>
            )}

            {messages.length > 0 && (
              <button
                onClick={clear}
                className="flex items-center gap-1.5 text-xs text-muted
                           hover:text-foreground transition-colors"
                title="New conversation"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">New chat</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </header>

        {/* Messages */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isLoadingHistory={isLoadingHistory}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
        {/* Input */}
        <ChatInput onSend={send} isLoading={isLoading} />
      </div>
    </div>
  );
}

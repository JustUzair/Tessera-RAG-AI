"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { chatWithAgent, fetchHistory } from "@/lib/api";
import type { ChatMessage } from "@/types";

const STORAGE_KEY = "tessera_thread_id";
const PAGE_SIZE = 20;

export function useChat(namespace: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // History pagination
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [historySkip, setHistorySkip] = useState(0);

  // Prevent double-hydration in StrictMode
  const hydrated = useRef(false);

  // ── On mount: restore threadId from localStorage, hydrate last N msgs ──
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    setThreadId(stored);

    // Load the most recent PAGE_SIZE messages silently
    (async () => {
      try {
        setIsLoadingHistory(true);
        const res = await fetchHistory(stored, 0, PAGE_SIZE);
        if (!res.messages.length) return;

        const hydrated: ChatMessage[] = res.messages.map(m => ({
          id: crypto.randomUUID(),
          role: m.role,
          content: m.content,
          ts: m.ts ? new Date(m.ts) : new Date(),
        }));

        setMessages(hydrated);
        setHasMore(res.hasMore);
        // Next "load more" will fetch the page before this one
        setHistorySkip(PAGE_SIZE);
      } catch {
        // Stale threadId or server down — clear it so a fresh one is created
        localStorage.removeItem(STORAGE_KEY);
        setThreadId(null);
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, []);

  // ── Persist threadId whenever it changes ──────────────────
  useEffect(() => {
    if (threadId) {
      localStorage.setItem(STORAGE_KEY, threadId);
    }
  }, [threadId]);

  // ── Load older messages ───────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!threadId || !hasMore || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const res = await fetchHistory(threadId, historySkip, PAGE_SIZE);

      const older: ChatMessage[] = res.messages.map(m => ({
        id: crypto.randomUUID(),
        role: m.role,
        content: m.content,
        ts: m.ts ? new Date(m.ts) : new Date(),
      }));

      // Prepend older messages to the top
      setMessages(prev => [...older, ...prev]);
      setHasMore(res.hasMore);
      setHistorySkip(s => s + PAGE_SIZE);
    } catch {
      // silently fail — user can retry
    } finally {
      setIsLoadingHistory(false);
    }
  }, [threadId, hasMore, historySkip, isLoadingHistory]);

  // ── Send a message ────────────────────────────────────────
  const send = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        ts: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await chatWithAgent({
          message: content.trim(),
          namespace,
          threadId,
        });

        if (res.threadId) setThreadId(res.threadId);

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: res.answer,
            citations: res.citations ?? [],
            ts: new Date(),
          },
        ]);
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            ts: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [namespace, threadId],
  );

  // ── Clear session ─────────────────────────────────────────
  const clear = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setHasMore(false);
    setHistorySkip(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    threadId,
    isLoading,
    isLoadingHistory,
    hasMore,
    send,
    loadMore,
    clear,
  };
}

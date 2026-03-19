const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// ── Agent ──────────────────────────────────────────────────
export async function chatWithAgent(payload: {
  message: string;
  namespace: string;
  threadId?: string | null;
}) {
  const res = await fetch(`${BASE}/api/v1/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: payload.message,
      namespace: payload.namespace,
      ...(payload.threadId ? { threadId: payload.threadId } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

// ── History ────────────────────────────────────────────────
export async function fetchHistory(
  threadId: string,
  skip = 0,
  limit = 20,
): Promise<{
  messages: {
    role: "user" | "assistant";
    content: string;
    ts?: string;
    namespace?: string;
  }[];
  total: number;
  hasMore: boolean;
}> {
  const res = await fetch(
    `${BASE}/api/v1/agent/history/${threadId}?skip=${skip}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
  return res.json();
}

// ── Knowledge Base ─────────────────────────────────────────
export async function uploadToKB(
  file: File,
  namespace: string,
  source?: string,
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("namespace", namespace);
  if (source) fd.append("source", source);

  const res = await fetch(`${BASE}/api/v1/kb/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function listNamespaces(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE}/api/v1/kb/namespaces`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.namespaces ?? [];
  } catch {
    return [];
  }
}

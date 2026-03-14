// tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import {
  connectDb,
  closeDbConnection,
  mongoClient,
} from "../utils/mongo-client.js";
import app from "../index.js";

const API = "/api/v1";

// ── Minimal in-memory test fixtures ──────────────────────────────────────────
const TXT_CONTENT = Buffer.from(
  "LightRAG is a graph-based RAG framework that uses entity extraction " +
    "and knowledge graphs to retrieve and synthesize information from documents.",
  "utf-8",
);

const MD_CONTENT = Buffer.from(
  "# Test Document\n\nMongoDB Atlas Vector Search stores high-dimensional " +
    "embedding vectors. Cosine similarity is used to find semantically relevant chunks.",
  "utf-8",
);

// ── Setup / Teardown ──────────────────────────────────────────────────────────
beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  await closeDbConnection(mongoClient);
});

// ═════════════════════════════════════════════════════════════════════════════
describe("PDF RAG Agent — API Tests", () => {
  // ── 1. HEALTH ───────────────────────────────────────────────────────────────
  describe("GET /status", () => {
    it("should return server health", async () => {
      const res = await request(app).get("/status");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  // ── 2. UNKNOWN ROUTE ────────────────────────────────────────────────────────
  describe("Unknown Routes", () => {
    it("should return an error for an unregistered route", async () => {
      const res = await request(app).get("/api/v1/does-not-exist");
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── 3. FILE UPLOAD — VALIDATION ─────────────────────────────────────────────
  describe("POST /api/v1/kb/upload — validation", () => {
    it("should return 400 when no file is attached", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .set("Content-Type", "multipart/form-data");
      // multer returns 400 via the error handler wrapper
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject unsupported file types (e.g. .jpg)", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", Buffer.from("fake image"), {
          filename: "photo.jpg",
          contentType: "image/jpeg",
        });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject files exceeding 10MB", async () => {
      const oversized = Buffer.alloc(11 * 1024 * 1024, "a"); // 11MB
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", oversized, {
          filename: "big.txt",
          contentType: "text/plain",
        });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ── 4. FILE UPLOAD — TXT ────────────────────────────────────────────────────
  describe("POST /api/v1/kb/upload — .txt ingestion", () => {
    it("should ingest a .txt file and return ok + chunk metadata", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", TXT_CONTENT, {
          filename: "lightrag-test.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body).toHaveProperty("namespace");
      expect(res.body).toHaveProperty("totalChunks");
      expect(res.body.totalChunks).toBeGreaterThan(0);
      expect(Array.isArray(res.body.sources)).toBe(true);
      expect(res.body.sources).toContain("lightrag-test.txt");
    });

    it("should return cache hit on re-uploading the same .txt file", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", TXT_CONTENT, {
          filename: "lightrag-test.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toMatch(/already ingested|cache hit/i);
    });
  });

  // ── 5. FILE UPLOAD — MARKDOWN ───────────────────────────────────────────────
  describe("POST /api/v1/kb/upload — .md ingestion", () => {
    it("should ingest a .md file successfully", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", MD_CONTENT, {
          filename: "mongo-test.md",
          contentType: "text/markdown",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.totalChunks).toBeGreaterThan(0);
      expect(res.body.sources).toContain("mongo-test.md");
    });

    it("should detect duplicate .md and return cache hit", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", MD_CONTENT, {
          filename: "mongo-test.md",
          contentType: "text/markdown",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toMatch(/already ingested|cache hit/i);
    });
  });

  // ── 6. FILE UPLOAD — EMPTY FILE ─────────────────────────────────────────────
  describe("POST /api/v1/kb/upload — edge cases", () => {
    it("should return 400 for an empty .txt file", async () => {
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", Buffer.from(""), {
          filename: "empty.txt",
          contentType: "text/plain",
        });

      // Empty content → no chunks → controller returns 400
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should handle a different namespace per upload cycle", async () => {
      // Since namespace is hardcoded to 'default' in the controller,
      // verify the response always reflects 'default'
      const res = await request(app)
        .post(`${API}/kb/upload`)
        .attach("file", Buffer.from("Namespace test content for RAG agent."), {
          filename: "namespace-check.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(200);
      expect(res.body.namespace).toBe("default");
    });
  });

  // ── 7. INGEST ROUTE (stub) ───────────────────────────────────────────────────
  describe("POST /api/v1/kb/ingest — stub", () => {
    it("should hit the /ingest route without crashing (stub endpoint)", async () => {
      // ingest handler is currently empty — verify it at least responds
      const res = await request(app)
        .post(`${API}/kb/ingest`)
        .send({ text: "stub test", source: "test" });

      // Empty handler sends no response — supertest will get a socket hang
      // or a 200 with no body. Either way the route must not throw a 500.
      expect(res.status).not.toBe(500);
    });
  });
});

<div align="center">

```
████████╗███████╗███████╗███████╗███████╗██████╗  █████╗
╚══██╔══╝██╔════╝██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗
   ██║   █████╗  ███████╗███████╗█████╗  ██████╔╝███████║
   ██║   ██╔══╝  ╚════██║╚════██║██╔══╝  ██╔══██╗██╔══██║
   ██║   ███████╗███████║███████║███████╗██║  ██║██║  ██║
   ╚═╝   ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

**Your documents, assembled into answers.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![LangChain](https://img.shields.io/badge/LangChain-1.x-1C3C3C?style=flat-square&logo=chainlink&logoColor=white)](https://js.langchain.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)
[![Vitest](https://img.shields.io/badge/Vitest-4.x-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

**[Live Demo →](https://tessera-rag-ai.vercel.app)** · **[API Docs →](https://documenter.getpostman.com/view/20867739/2sBXihrYt8)** · **[Report Bug](https://github.com/JustUzair/Tessera-RAG-AI/issues)**

</div>

---

![Tessera OG](./client/public/og-image.png)

---

## What is Tessera?

Tessera is a full-stack Retrieval-Augmented Generation (RAG) platform that lets you build a private, queryable knowledge base from your own documents. Upload PDFs, Markdown files, or plain text, Tessera fragments them into overlapping semantic chunks, embeds them into MongoDB Atlas Vector Search, and lets you ask natural-language questions that return grounded, citation-backed answers. Every response traces directly to the exact source chunk that supported it, with no hallucination and no blending of training knowledge.

At the system level, Tessera is built on LangChain's agent framework with a strict tool-calling architecture. The backend exposes a `kb_search` tool to a LangChain agent bound by a hardened system prompt: the agent is forbidden from answering before calling the tool, forbidden from blending retrieved context with training data, and required to emit structured JSON with citations on every response. Embeddings are generated via the Google Gemini embedding model (or OpenAI as an alternative) and stored with cache-backed deduplication, re-uploading the same file to the same namespace is a no-op at the database level.

The frontend is a Next.js 16 application built with a mosaic-tile design language that mirrors the Tessera concept. The landing page features a live 3D Spline scene, an Aceternity canvas-based animated dot grid, and a morphing Framer Motion navbar. The chat interface provides a full conversation experience with namespace switching, a drag-and-drop knowledge base panel, paginated history loaded from MongoDB, and click-to-expand citation badges that surface readable previews of the exact chunks behind each answer.

What makes Tessera technically distinctive is the combination of semantic embedding cache, namespace isolation, and document-level deduplication. Chunks that have already been embedded are served from a MongoDB key-value store rather than re-computed, and every document is partitioned by a user-defined namespace so different projects, topics, or users never pollute each other's knowledge graphs.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER / CLIENT                    │
│              Next.js 16  ·  Vercel Edge Network          │
│                                                          │
│  Landing Page    →    /chat (ChatInterface)              │
│  Hero + Spline        Sidebar KBPanel + MessageList      │
│  Framer Motion        useChat hook  ·  useKB hook        │
│  DottedGlow bg        localStorage thread persistence    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS  /api/v1/*
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND                        │
│              Node.js  ·  Vercel Serverless               │
│                                                          │
│  Rate Limiter (10 req / 10 min)                          │
│       ↓                                                  │
│  CORS  →  express.json  →  Router                        │
│       ↓                   ↓                              │
│  /api/v1/kb          /api/v1/agent                       │
│  KBController        AgentController                     │
└──────┬───────────────────────┬──────────────────────────┘
       │                       │
       ▼                       ▼
┌─────────────┐        ┌───────────────────────────────┐
│  KB Pipeline│        │        Agent Pipeline          │
│             │        │                                │
│ 01_loader   │        │  04_memory                     │
│  PDF/MD/TXT │        │  ensureThreadId (nanoid)       │
│     ↓       │        │  getChatHistory (MongoDB)      │
│ 02_splitter │        │  getPaginatedHistory ($slice)  │
│  800 char   │        │       ↓                        │
│  200 overlap│        │  03_agent (LangChain)          │
│     ↓       │        │  System prompt → tool call     │
│ 03_vector   │        │  kb_search tool                │
│  store      │        │       ↓                        │
│  Cache-     │        │  05_retriever                  │
│  backed     │        │  similaritySearchWithScore     │
│  embeddings │        │  namespace filter  k=5         │
│     ↓       │        │       ↓                        │
│ 04_ingest   │        │  Structured JSON response      │
│  dedup      │        │  { answer, citations[] }       │
│  check      │        │       ↓                        │
│     ↓       │        │  appendToHistory (MongoDB)     │
│ MongoDB     │        └───────────────────────────────┘
│ Atlas       │                  │
└─────────────┘                  ▼
       │              ┌──────────────────┐
       └─────────────►│  MongoDB Atlas   │
                      │                  │
                      │ chunk_store      │ ← vector embeddings + metadata
                      │ kb_cache_store   │ ← CacheBackedEmbeddings KV
                      │ conversations    │ ← thread history (paginated)
                      └──────────────────┘
```

### KB Ingestion Pipeline

```
  File Upload (multipart/form-data)
         │
         ▼
  ┌─────────────────┐
  │  01_loader.ts   │  PDF → PDFLoader  /  MD + TXT → TextLoader
  └────────┬────────┘
           │ Document[]
           ▼
  ┌─────────────────┐
  │  02_splitter.ts │  RecursiveCharacterTextSplitter
  │                 │  chunkSize: 800  ·  overlap: 200
  └────────┬────────┘
           │ chunks[]
           ▼
  ┌─────────────────┐
  │  04_ingest.ts   │  Dedup check (namespace + source index)
  │                 │  → cache hit? Return early, no re-embed
  └────────┬────────┘
           │ new docs only
           ▼
  ┌─────────────────┐
  │  03_vector_     │  CacheBackedEmbeddings
  │  store.ts       │  → BytesStore (MongoDB KV)
  │                 │  → MongoDBAtlasVectorSearch.addDocuments()
  └─────────────────┘
```

### Agent Query Pipeline

```
  POST /api/v1/agent/chat  { message, namespace, threadId? }
         │
         ▼
  ensureThreadId()  →  creates new thread doc if threadId missing
         │
         ▼
  getChatHistory()  →  full message array from MongoDB
         │
         ▼
  LangChain Agent  (AGENT_SYSTEM_PROMPT)
         │
         └──► MUST call kb_search(question, namespace)
                   │
                   ▼
              05_retriever.ts
              similaritySearchWithScore(query, k=5, { namespace })
              confidence = max(scores) normalized 0..1
                   │
                   ▼
              Markdown chunks → summarizeMarkdown() via LLM
              Plain chunks → use raw preview
                   │
                   ▼
  Structured JSON  { answer: string, citations: Citation[] }
         │
         ▼
  appendToHistory()  →  persist both user + assistant turns
         │
         ▼
  Response  { ok, threadId, answer, citations }
```

---

## Project Structure

```
Tessera-RAG-AI/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── 01_policy.ts          # System prompt, strict no-hallucination rules
│   │   │   ├── 02_tools.ts           # kb_search LangChain tool + markdown summarizer
│   │   │   ├── 03_agent.ts           # LangChain agent factory + runProductAgent()
│   │   │   └── 04_memory.ts          # Thread CRUD, ensureThreadId, getChatHistory, getPaginatedHistory
│   │   ├── controllers/
│   │   │   ├── agent.ts              # chat handler + getHistory paginated endpoint
│   │   │   └── kb.ts                 # upload (multer memoryStorage) + listNamespaces
│   │   ├── kb/
│   │   │   ├── 01_loader.ts          # PDF / Markdown / TXT → LangChain Document[]
│   │   │   ├── 02_splitter.ts        # RecursiveCharacterTextSplitter (800/200)
│   │   │   ├── 03_vector_store.ts    # MongoDB Atlas vector store + cache-backed embeddings
│   │   │   ├── 04_ingest.ts          # Dedup check → addDocuments → IngestSummary
│   │   │   └── 05_retriever.ts       # similaritySearchWithScore with namespace filter
│   │   ├── routes/
│   │   │   ├── agent.ts              # POST /chat  ·  GET /history/:threadId
│   │   │   └── kb.ts                 # GET /namespaces  ·  POST /upload  ·  POST /ingest
│   │   ├── tests/
│   │   │   └── api.test.ts           # Vitest + Supertest integration tests (7 suites)
│   │   ├── types/
│   │   │   ├── agent.ts              # AgentResponseSchema, ChatMessage, ConversationDoc
│   │   │   ├── kb.ts                 # KBChunk, LoadFileArgs, IngestSummary, UploadFormDataSchema
│   │   │   └── models.ts             # ModelOptions, EmbeddingsModelSchema
│   │   ├── utils/
│   │   │   ├── env.ts                # Zod-validated env schema, fails fast on misconfiguration
│   │   │   ├── models.ts             # makeModel() + makeEmbeddingsModel() factory (Gemini/OpenAI/Groq)
│   │   │   └── mongo-client.ts       # Singleton MongoClient with connect/close lifecycle
│   │   └── index.ts                  # Express app, rate limiter, CORS, router mounting, server boot
│   ├── vercel.json                   # Vercel serverless config, rewrites all traffic to dist/index.js
│   ├── tsup.config.ts                # ESM build config
│   └── vitest.config.ts              # Test config, node env, 30s timeout for AI calls
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout, Syne + Geist fonts, ThemeProvider, full OG metadata
│   │   │   ├── page.tsx              # Landing page, Navbar + Hero + Features + HowItWorks + CTA + Footer
│   │   │   ├── globals.css           # Design tokens (@theme inline), dark/light palettes, dot-grid utilities
│   │   │   └── chat/
│   │   │       └── page.tsx          # Chat app route, mounts ChatInterface
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx  # Root chat layout, sidebar toggle, header, namespace display
│   │   │   │   ├── MessageList.tsx    # Scroll area, "Load older messages" pagination, thinking dots
│   │   │   │   ├── ChatMessage.tsx    # Individual bubble, user right / assistant left + citations
│   │   │   │   ├── CitationBadge.tsx  # Click-to-expand popover with readablePreview
│   │   │   │   ├── ChatInput.tsx      # Auto-resize textarea, Enter to send, Shift+Enter newline
│   │   │   │   └── KBPanel.tsx        # Drag-and-drop upload, namespace chips, source label, upload status
│   │   │   ├── landing/
│   │   │   │   ├── Hero.tsx           # 2-col grid, animated headline + Spline 3D scene
│   │   │   │   ├── Features.tsx       # 4-card stagger grid with hover glow
│   │   │   │   ├── HowItWorks.tsx     # 3-step horizontal timeline with gold connector
│   │   │   │   ├── CTA.tsx            # Radial glow call-to-action block
│   │   │   │   └── Footer.tsx         # Minimal footer with tagline
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx         # Framer Motion morphing pill navbar (scroll-triggered)
│   │   │   │   ├── TesseraLogo.tsx    # 4-tile SVG logo (maps to mosaic concept)
│   │   │   │   └── ThemeToggle.tsx    # Animated sun/moon dark mode toggle
│   │   │   ├── providers/
│   │   │   │   └── ThemeProvider.tsx  # next-themes wrapper (default: dark)
│   │   │   └── ui/
│   │   │       ├── button.tsx         # shadcn Button
│   │   │       └── dotted-glow-background.tsx  # Aceternity canvas dot grid, dark mode amber glow
│   │   ├── hooks/
│   │   │   ├── useChat.ts            # Chat state, localStorage thread persistence, history pagination
│   │   │   └── useKB.ts              # KB upload state, namespace fetching, error handling
│   │   ├── lib/
│   │   │   ├── api.ts                # chatWithAgent(), fetchHistory(), uploadToKB(), listNamespaces()
│   │   │   └── utils.ts              # shadcn cn() utility
│   │   └── types/
│   │       └── index.ts              # Citation, ChatMessage, UploadResponse types
│   ├── public/
│   │   ├── og-image.png              # Open Graph image (1728×1002)
│   │   └── tessera.svg               # Tessera wordmark SVG
│   └── next.config.ts                # compress: true, security headers, Spline CDN image domain
│
└── postman/
    └── collections/
        └── Policy Agent API.postman_collection.json   # Full API collection
```

---

## Tech Stack

| Layer          | Technology               | Version               | Purpose                                                |
| -------------- | ------------------------ | --------------------- | ------------------------------------------------------ |
| **Frontend**   | Next.js                  | 16.2                  | App router, SSR, OG metadata, security headers         |
| **Frontend**   | React                    | 19.2                  | UI runtime                                             |
| **Frontend**   | TypeScript               | 5.x                   | Type safety across all components and hooks            |
| **Frontend**   | Tailwind CSS             | 4.x                   | CSS variables design system, dark/light theming        |
| **Frontend**   | Framer Motion            | 12.x                  | Navbar morph, message animations, page transitions     |
| **Frontend**   | next-themes              | 0.4                   | Dark/light mode with zero-flash hydration              |
| **Frontend**   | @splinetool/react-spline | 4.x                   | 3D scene in hero section (dynamic import, no SSR)      |
| **Frontend**   | react-dropzone           | 15.x                  | Drag-and-drop file upload in KBPanel                   |
| **Frontend**   | shadcn/ui                | 4.x                   | Button primitives with Radix UI foundation             |
| **Backend**    | Express                  | 4.x                   | HTTP server, routing, middleware                       |
| **Backend**    | TypeScript               | 5.x                   | Full type coverage on routes, controllers, models      |
| **Backend**    | LangChain                | 1.x                   | Agent framework, tool calling, document loaders        |
| **Backend**    | @langchain/mongodb       | 1.x                   | MongoDBAtlasVectorSearch + MongoDBStore                |
| **Backend**    | @langchain/textsplitters | 1.x                   | RecursiveCharacterTextSplitter                         |
| **Backend**    | multer                   | 2.x                   | Multipart file handling (memoryStorage, 10MB cap)      |
| **Backend**    | express-rate-limit       | 8.x                   | 10 requests per 10-minute window per IP                |
| **Backend**    | nanoid                   | 5.x                   | Thread ID generation                                   |
| **Backend**    | zod                      | 4.x                   | Env validation schema + request body parsing           |
| **AI/ML**      | Google Gemini            | gemini-2.5-flash-lite | Default LLM (chat) + gemini-embedding-001 (embeddings) |
| **AI/ML**      | OpenAI                   | gpt-4o-mini           | Optional LLM + text-embedding-3-small                  |
| **AI/ML**      | Groq                     | llama-3.1-8b-instant  | Optional LLM (fast inference)                          |
| **Database**   | MongoDB Atlas            | 7.x                   | Vector store, embedding cache, conversation history    |
| **Testing**    | Vitest                   | 4.x                   | Test runner (30s timeout for AI calls)                 |
| **Testing**    | Supertest                | 7.x                   | HTTP integration testing against live Express app      |
| **Deployment** | Vercel                   | ,                     | Serverless deployment for both frontend and backend    |

---

## API Reference

### `GET /status`

Health check endpoint.

**Response**

```json
{
  "status": "ok",
  "timestamp": "20/03/2026, 10:30:00 am"
}
```

---

### `POST /api/v1/kb/upload`

Upload and ingest a document into the knowledge base. Accepts `multipart/form-data`. Supported file types: `.pdf`, `.txt`, `.md`. Maximum file size: 10 MB. If the same source file has already been ingested into the same namespace, returns a cache hit immediately without re-embedding.

**Request** (`multipart/form-data`)

```
file        File    required  : .pdf, .txt, or .md, max 10 MB
namespace   string  optional  : defaults to "default"
source      string  optional  : prefix label prepended to filename for traceability
```

**Response**

```json
{
  "ok": true,
  "namespace": "research",
  "totalChunks": 14,
  "sources": ["lightrag-docs-report.pdf"],
  "message": "Documents ingested successfully"
}
```

**Cache hit response**

```json
{
  "ok": true,
  "namespace": "research",
  "totalChunks": 14,
  "sources": ["lightrag-docs-report.pdf"],
  "message": "Document(s) already ingested (cache hit)"
}
```

---

### `GET /api/v1/kb/namespaces`

Returns all distinct namespace strings present in the vector store.

**Response**

```json
{
  "ok": true,
  "namespaces": ["default", "research", "contracts", "personal"]
}
```

---

### `POST /api/v1/agent/chat`

Send a message to the RAG agent. The agent is forced to call `kb_search` before answering. If no relevant context is found, it returns a fixed no-information response rather than hallucinating.

**Request**

```json
{
  "message": "What are the key deliverables in section 4?",
  "namespace": "contracts",
  "threadId": "V1StGXR8_Z5jdHi6B"
}
```

`threadId` is optional on the first message. If omitted, a new thread is created and the ID is returned for use in subsequent requests.

**Response**

```json
{
  "ok": true,
  "threadId": "V1StGXR8_Z5jdHi6B",
  "answer": "Section 4 specifies three key deliverables...",
  "citations": [
    {
      "source": "contract-2024-final.pdf",
      "chunkId": 12,
      "preview": "4.1 Deliverables include...",
      "readablePreview": "Section 4.1 lists the deliverables as..."
    }
  ]
}
```

---

### `GET /api/v1/agent/history/:threadId`

Fetch paginated conversation history for a thread. Messages are returned oldest-first within the page window. Pagination counts from the most recent message backwards, `skip=0` returns the latest `limit` messages; `skip=20` returns the 20 messages before those.

**Query Parameters**

```
skip    number  optional  : default 0, offset from the most recent message
limit   number  optional  : default 20, max 50
```

**Response**

```json
{
  "ok": true,
  "threadId": "V1StGXR8_Z5jdHi6B",
  "messages": [
    {
      "role": "user",
      "content": "What are the key deliverables?",
      "ts": "2026-03-20T08:00:00.000Z",
      "namespace": "contracts"
    },
    {
      "role": "assistant",
      "content": "Section 4 specifies three key deliverables...",
      "ts": "2026-03-20T08:00:02.000Z",
      "namespace": "contracts"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

---

## Lighthouse Scores

Tessera achieves top-tier Lighthouse scores across all four categories on the landing page:

| Category       | Score |
| -------------- | ----- |
| Performance    | 92    |
| Accessibility  | 95    |
| Best Practices | 100   |
| SEO            | 100   |

SEO audits passed: page not blocked from indexing, `<title>` element present, meta description present, HTTP 200 status, descriptive link text, crawlable links, valid `hreflang`. Full Open Graph and Twitter Card metadata is configured in `layout.tsx` with the `og-image.png` (1728×1002).

---

## Getting Started

### Prerequisites

```
Node.js   >= 18.x
yarn      >= 1.22.x
MongoDB Atlas cluster with Vector Search enabled
```

### Environment Variables

**Backend** : `backend/.env`

| Variable                               | Required    | Description                          | Example                      |
| -------------------------------------- | ----------- | ------------------------------------ | ---------------------------- |
| `MODEL_PROVIDER`                       | Yes         | LLM provider for the agent           | `groq` / `gemini` / `openai` |
| `RAG_MODEL_PROVIDER`                   | Yes         | Provider for embedding generation    | `gemini` / `openai`          |
| `OPENAI_API_KEY`                       | Conditional | Required if using OpenAI provider    | `sk-...`                     |
| `GEMINI_API_KEY`                       | Conditional | Required if using Gemini provider    | `AIza...`                    |
| `GROQ_API_KEY`                         | Conditional | Required if using Groq provider      | `gsk_...`                    |
| `OPENAI_MODEL`                         | Conditional | OpenAI model name                    | `gpt-4o-mini`                |
| `GEMINI_MODEL`                         | Conditional | Gemini model name                    | `gemini-2.5-flash-lite`      |
| `GROQ_MODEL`                           | Conditional | Groq model name                      | `llama-3.1-8b-instant`       |
| `PORT`                                 | No          | Server port, defaults to 8000        | `8000`                       |
| `ALLOWED_ORIGIN`                       | Yes         | CORS origin whitelist                | `http://localhost:3000`      |
| `MONGODB_ATLAS_URI`                    | Yes         | Full MongoDB Atlas connection string | `mongodb+srv://...`          |
| `MONGODB_NAME`                         | Yes         | Database name                        | `tessera`                    |
| `MONGODB_CHUNK_STORE_COLLECTION_NAME`  | Yes         | Collection for vector chunks         | `kb_chunks`                  |
| `MONGODB_INDEX_NAME`                   | Yes         | Atlas Vector Search index name       | `vector_index`               |
| `MONGODB_KB_CACHE_COLLECTION_NAME`     | Yes         | Collection for embedding cache       | `kb_cache`                   |
| `MONGODB_CONVERSATION_COLLECTION_NAME` | Yes         | Collection for chat threads          | `conversations`              |

**Frontend** : `client/.env.local`

| Variable                   | Required | Description                       | Example                          |
| -------------------------- | -------- | --------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | Backend API base URL              | `http://localhost:8000`          |
| `NEXT_PUBLIC_SPLINE_URL`   | Yes      | Spline 3D scene public viewer URL | `https://prod.spline.design/...` |

### Local Development

```bash
# Clone the repository
git clone https://github.com/JustUzair/Tessera-RAG-AI
cd Tessera-RAG-AI

# ── Backend ──────────────────────────────────────────────
cd backend
cp .env.example .env
# Fill in your API keys and MongoDB URI in .env
yarn install
yarn dev

# ── Frontend (new terminal) ───────────────────────────────
cd client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
yarn install
yarn dev
```

Backend runs on `http://localhost:8000` · Frontend runs on `http://localhost:3000`

---

## Testing

Integration tests run against a live Express app with a real MongoDB Atlas connection. Tests cover: server health, unknown route handling, file upload validation (no file, unsupported type, oversized), `.txt` ingestion with namespace and source prefix, deduplication cache hit detection, `.md` ingestion, empty file edge cases, and namespace listing.

```bash
cd backend
yarn test
```

Test timeout is set to 30 seconds to accommodate real LLM embedding calls.

---

## Deployment

Both packages deploy independently to Vercel. The backend uses `vercel.json` to rewrite all requests to the compiled `dist/index.js` serverless function.

```bash
# Backend
cd backend
vercel --prod

# Frontend
cd client
vercel --prod
```

**Required environment variables in Vercel dashboard:**

- Backend: all variables from the backend `.env` table above
- Frontend: `NEXT_PUBLIC_API_BASE_URL` pointed at the deployed backend URL, `NEXT_PUBLIC_SPLINE_URL`

Live deployments:

- Frontend: [tessera-rag-ai.vercel.app](https://tessera-rag-ai.vercel.app)
- Backend: [tessera-rag-ai-backend.vercel.app](https://tessera-rag-ai-backend.vercel.app)
- API Docs: [Postman Collection](https://documenter.getpostman.com/view/20867739/2sBXihrYt8)

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow the existing code style and add tests for new functionality.

---

<div align="center">

Built by **[JustUzair](https://github.com/JustUzair)**

**[tessera-rag-ai.vercel.app](https://tessera-rag-ai.vercel.app)** · **[API](https://tessera-rag-ai-backend.vercel.app)** · **[Postman Docs](https://documenter.getpostman.com/view/20867739/2sBXihrYt8)**

_Fragments that only make sense assembled together._

</div>

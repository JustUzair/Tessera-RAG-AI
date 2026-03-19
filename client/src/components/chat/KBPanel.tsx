"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useKB } from "@/hooks/useKB";

interface Props {
  namespace: string;
  onNamespaceChange: (ns: string) => void;
  kb: ReturnType<typeof useKB>;
}

export function KBPanel({ namespace, onNamespaceChange, kb }: Props) {
  const [source, setSource] = useState("");

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (file) kb.upload(file, namespace, source || undefined);
    },
    [kb, namespace, source],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
    disabled: kb.uploadState === "uploading",
  });

  return (
    <div className="w-full h-full flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-sm text-foreground">
              Knowledge Base
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Upload &amp; manage namespaces
            </p>
          </div>
          <button
            onClick={kb.fetchNamespaces}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
            title="Refresh namespaces"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Namespace selector */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold text-muted uppercase tracking-widest">
            Namespace
          </label>

          <input
            value={namespace}
            onChange={e => onNamespaceChange(e.target.value)}
            placeholder="default"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface
                       text-sm text-foreground placeholder:text-muted
                       outline-none focus:border-accent/50 transition-colors"
          />

          {/* Existing namespace chips */}
          {kb.namespaces.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {kb.namespaces.map(ns => (
                <button
                  key={ns}
                  onClick={() => onNamespaceChange(ns)}
                  className={`text-xs px-2.5 py-0.5 rounded-full border transition-all duration-150 ${
                    ns === namespace
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-border text-muted hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {ns}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Source label */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold text-muted uppercase tracking-widest">
            Source label{" "}
            <span className="normal-case font-normal opacity-60">
              (optional)
            </span>
          </label>
          <input
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="e.g. product-v2-docs"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface
                       text-sm text-foreground placeholder:text-muted
                       outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Dropzone */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-semibold text-muted uppercase tracking-widest">
            Upload file
          </label>
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-2 border-dashed p-7 text-center
                        cursor-pointer transition-all duration-200 select-none
                        ${
                          isDragActive
                            ? "border-accent/70 bg-accent/6 scale-[1.01]"
                            : "border-border hover:border-accent/35 hover:bg-surface/60"
                        }
                        ${kb.uploadState === "uploading" ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
                <Upload size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isDragActive
                    ? "Drop it here"
                    : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-muted mt-1">
                  PDF · TXT · MD · max 10 MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload status */}
        <AnimatePresence mode="wait">
          {kb.uploadState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs ${
                kb.uploadState === "uploading"
                  ? "bg-surface text-muted border border-border"
                  : kb.uploadState === "success"
                    ? "bg-emerald-500/8 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/8 text-red-400 border border-red-500/20"
              }`}
            >
              {kb.uploadState === "uploading" && (
                <Loader2
                  size={14}
                  className="animate-spin flex-shrink-0 mt-0.5"
                />
              )}
              {kb.uploadState === "success" && (
                <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
              )}
              {kb.uploadState === "error" && (
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              )}

              <div className="leading-relaxed">
                {kb.uploadState === "uploading" && "Uploading and embedding…"}
                {kb.uploadState === "error" && (kb.error ?? "Upload failed")}
                {kb.uploadState === "success" && kb.lastUpload && (
                  <>
                    <span className="font-semibold block">
                      {kb.lastUpload.totalChunks} chunks ingested
                    </span>
                    <span className="opacity-70">
                      namespace: {kb.lastUpload.namespace}
                    </span>
                    {kb.lastUpload.sources?.length > 0 && (
                      <span className="block opacity-50 truncate mt-0.5">
                        {kb.lastUpload.sources.join(", ")}
                      </span>
                    )}
                  </>
                )}
              </div>

              {kb.uploadState !== "uploading" && (
                <button
                  onClick={kb.resetUploadState}
                  className="ml-auto text-[10px] opacity-50 hover:opacity-100 flex-shrink-0"
                >
                  ✕
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";
import { useState, useCallback, useEffect } from "react";
import { uploadToKB, listNamespaces } from "@/lib/api";
import type { UploadResponse } from "@/types";

type UploadState = "idle" | "uploading" | "success" | "error";

export function useKB() {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNamespaces = useCallback(async () => {
    const ns = await listNamespaces();
    setNamespaces(ns);
  }, []);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  const upload = useCallback(
    async (file: File, namespace: string, source?: string) => {
      setUploadState("uploading");
      setError(null);
      try {
        const res: UploadResponse = await uploadToKB(file, namespace, source);
        setLastUpload(res);
        setUploadState("success");
        await fetchNamespaces();
      } catch {
        setUploadState("error");
        setError("Upload failed. Check the console and retry.");
      }
    },
    [fetchNamespaces],
  );

  const resetUploadState = useCallback(() => {
    setUploadState("idle");
    setLastUpload(null);
    setError(null);
  }, []);

  return {
    namespaces,
    uploadState,
    lastUpload,
    error,
    upload,
    fetchNamespaces,
    resetUploadState,
  };
}

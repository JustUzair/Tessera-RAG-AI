import express from "express";
import KBController from "../controllers/kb.js";

const router = express.Router();

router.get("/namespaces", KBController.listNamespaces);
router.post(
  "/upload",
  KBController.uploadFileHandler.single("file") as any,
  KBController.upload,
);
router.post("/ingest", KBController.ingest);
export default router;

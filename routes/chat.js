import express from "express";
import { authenticateToken } from "../middleware.js";
import {
  getConversations,
  getChatHistory,
  sendMessage,
  markChatRead,
  stream,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/conversations", authenticateToken, getConversations);
router.get("/with/:userId", authenticateToken, getChatHistory);
router.post("/messages", authenticateToken, sendMessage);
router.patch("/with/:userId/read", authenticateToken, markChatRead);

// Real-time stream (SSE)
router.get("/stream", authenticateToken, stream);

export default router;

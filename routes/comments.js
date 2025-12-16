import express from "express";
import { authenticateToken } from "../middleware.js";
import { deleteComment } from "../controllers/commentsController.js";

const router = express.Router();

router.delete("/:commentId", authenticateToken, deleteComment);

export default router;

import express from "express";
import { authenticateToken } from "../middleware.js";
import {
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  unfriend,
  getConnections,
  getSuggestions,
} from "../controllers/friendshipsController.js";

const router = express.Router();

// Send request
router.post("/request", authenticateToken, sendFriendRequest);

// Requests lists
router.get("/requests/incoming", authenticateToken, getIncomingRequests);
router.get("/requests/outgoing", authenticateToken, getOutgoingRequests);

// Accept / Reject by other user id
router.patch("/requests/:otherUserId/accept", authenticateToken, acceptRequest);
router.patch("/requests/:otherUserId/reject", authenticateToken, rejectRequest);

// Unfriend (also cancels pending)
router.delete("/:otherUserId", authenticateToken, unfriend);

// Connections list
router.get("/", authenticateToken, getConnections);

// Suggestions
router.get("/suggestions", authenticateToken, getSuggestions);

export default router;

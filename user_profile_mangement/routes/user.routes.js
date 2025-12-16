import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import * as controller from "../controllers/user.controller.js";

const router = Router();

router.get("/me", auth, controller.getProfile);
router.put("/me", auth, controller.updateProfile);

router.post("/me/avatar", auth, upload.single("avatar"), controller.uploadAvatar);
router.post("/me/cover", auth, upload.single("cover"), controller.uploadCover);

router.get("/search", auth, controller.searchUsers);
router.get("/me/stats", auth, controller.userStats);

export default router;

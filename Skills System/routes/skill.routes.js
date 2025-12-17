import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as controller from "../controllers/skill.controller.js";

const router = Router();

router.post("/", auth, controller.addSkill);
router.put("/:id", auth, controller.updateSkill);
router.delete("/:id", auth, controller.deleteSkill);

router.get("/me", auth, controller.mySkills);
router.get("/", controller.browseSkills);

export default router;

import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as controller from "../controllers/skill.controller.js";

const router = Router();

router.post("/", auth, controller.addSkill);      
router.get("/me", auth, controller.getMySkills); 
router.get("/user/:userId", auth, controller.getUserSkills);
router.delete("/:id", auth, controller.deleteSkill);

export default router;
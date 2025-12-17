import * as skillService from "../services/skill.service.js";

/* Add skill */
export const addSkill = async (req, res) => {
  const skill = await skillService.addSkill(req.user.id, req.body);
  res.status(201).json(skill);
};

/* Update skill */
export const updateSkill = async (req, res) => {
  const skill = await skillService.updateSkill(
    req.params.id,
    req.user.id,
    req.body
  );
  if (!skill) return res.status(403).json({ message: "Not allowed" });
  res.json(skill);
};

/* Delete skill */
export const deleteSkill = async (req, res) => {
  await skillService.deleteSkill(req.params.id, req.user.id);
  res.json({ message: "Skill deleted" });
};

/* Get my skills */
export const mySkills = async (req, res) => {
  const skills = await skillService.getUserSkills(req.user.id);
  res.json(skills);
};

/* Browse skills */
export const browseSkills = async (req, res) => {
  const skills = await skillService.browseSkills(req.query);
  res.json(skills);
};

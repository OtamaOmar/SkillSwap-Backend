import * as skillService from "../services/skill.service.js";

export const addSkill = async (req, res) => {
  try {
    const skill = await skillService.addSkill(req.user.id, req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMySkills = async (req, res) => {
  try {
    const skills = await skillService.getUserSkills(req.user.id);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserSkills = async (req, res) => {
  try {
    const skills = await skillService.getUserSkills(req.params.userId);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    await skillService.deleteSkill(req.params.id, req.user.id);
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
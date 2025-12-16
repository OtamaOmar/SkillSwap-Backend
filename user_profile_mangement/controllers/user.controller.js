import * as userService from "../services/user.service.js";

/* GET profile */
export const getProfile = async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.json(user);
};

/* UPDATE profile */
export const updateProfile = async (req, res) => {
  const user = await userService.updateUser(req.user.id, req.body);
  res.json(user);
};

/* UPLOAD avatar */
export const uploadAvatar = async (req, res) => {
  const path = `/uploads/${req.file.filename}`;
  await userService.updateAvatar(req.user.id, path);
  res.json({ avatar: path });
};

/* UPLOAD cover */
export const uploadCover = async (req, res) => {
  const path = `/uploads/${req.file.filename}`;
  await userService.updateCover(req.user.id, path);
  res.json({ cover: path });
};

/* SEARCH users */
export const searchUsers = async (req, res) => {
  const users = await userService.searchUsers(req.query.q);
  res.json(users);
};

/* USER stats */
export const userStats = async (req, res) => {
  const stats = await userService.getUserStats(req.user.id);
  res.json(stats);
};

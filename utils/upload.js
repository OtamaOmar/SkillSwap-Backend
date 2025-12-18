// utils/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const uploadsBase = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsBase, { recursive: true });

// Ensure subfolders exist
const ensureDir = (sub) => {
  const dir = path.join(uploadsBase, sub);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

// Common storage factory
const makeStorage = (subfolder) => {
  const dir = ensureDir(subfolder);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)."));
};

// Upload handlers
export const postImageUpload = multer({
  storage: makeStorage("posts"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const avatarUpload = multer({
  storage: makeStorage("avatars"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const coverUpload = multer({
  storage: makeStorage("covers"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

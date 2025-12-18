import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skill.routes.js"; // تأكد إنك عملت الملف ده

dotenv.config();

const app = express(); 

app.use(express.json()); 
app.use(cors());       

app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);

const PORT = process.env.DB_PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
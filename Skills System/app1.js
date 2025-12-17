import express from "express";
import skillRoutes from "./routes/skill.routes.js";

const app = express(); 

app.use(express.json()); 


app.use("/api/skills", skillRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Test it at http://localhost:${PORT}/api/skills`);
});
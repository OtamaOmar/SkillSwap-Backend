import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import usersRoutes from "./routes/users.js";
import postsRoutes from "./routes/posts.js";
import skillsRoutes from "./routes/skills.js";
import friendshipsRoutes from "./routes/friendships.js";
import chatRoutes from "./routes/chat.js";
import commentsRoutes from "./routes/comments.js";
import notificationsRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use("/api/friends", friendshipsRoutes);
app.use(express.json());
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Basic health check
app.get("/", (req, res) => {
  res.json({ 
    message: "SkillSwap Backend API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, username, full_name } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const result = await pool.query(
      'INSERT INTO profiles (email, password_hash, username, full_name) VALUES ($1, $2, $3, $4) RETURNING id, email, username, full_name',
      [email, hashedPassword, username, full_name]
    );
    
    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      user: { id: user.id, email: user.email, username: user.username, full_name: user.full_name },
      token,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const result = await pool.query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Check if password exists
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      user: { id: user.id, email: user.email, username: user.username, full_name: user.full_name },
      token,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    // Logout is handled on the client side with JWT tokens
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // Verify and decode the refresh token
    const decoded = jwt.verify(refresh_token, JWT_SECRET);
    
    // Generate new access token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ session: { access_token: newToken } });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: error.message });
  }
});

// API Routes
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/friendships", friendshipsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`SkillSwap backend running on http://localhost:${PORT}`);
});
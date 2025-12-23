import { pool } from './db.js';
import jwt from 'jsonwebtoken';

// Use JWT_SECRET from environment, fallback to .env or safe default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const result = await pool.query('SELECT id, email, username, full_name FROM profiles WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    req.user = { 
      id: user.id, 
      email: user.email,
      username: user.username,
      full_name: user.full_name
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(403).json({ error: 'Authentication failed' });
  }
};

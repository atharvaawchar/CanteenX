import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register Student
router.post('/register', (req, res) => {
  try {
    const { name, email, student_id, department, year, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR (student_id = ? AND student_id IS NOT NULL)').get(email, student_id || '');
    if (existingUser) {
      return res.status(400).json({ error: 'User with this Email or Student ID already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, student_id, department, year, password, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?, 'student', ?)
    `);
    const result = insertUser.run(name, email, student_id || '', department || '', year || '', passwordHash, avatar);
    const userId = result.lastInsertRowid;

    // Create wallet for new student
    db.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?)').run(userId, 200.0);
    const wallet = db.prepare('SELECT id FROM wallets WHERE user_id = ?').get(userId);
    if (wallet) {
      db.prepare('INSERT INTO wallet_transactions (wallet_id, type, amount, description) VALUES (?, ?, ?, ?)').run(wallet.id, 'credit', 200.0, 'Welcome Signup Bonus');
    }

    const newUser = db.prepare('SELECT id, name, email, student_id, department, year, role, avatar FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { loginKey, password } = req.body; // loginKey can be email or student_id

    if (!loginKey || !password) {
      return res.status(400).json({ error: 'Email/Student ID and Password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ? OR student_id = ?').get(loginKey, loginKey);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Email/Student ID or Password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Email/Student ID or Password' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, student_id, department, year, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const wallet = db.prepare('SELECT balance FROM wallets WHERE user_id = ?').get(req.user.id);
    res.json({ user, walletBalance: wallet ? wallet.balance : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

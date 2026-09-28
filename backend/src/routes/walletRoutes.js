import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get wallet details & transactions
router.get('/', authenticateToken, (req, res) => {
  try {
    let wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
    if (!wallet) {
      db.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, 200.0)').run(req.user.id);
      wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
    }

    const transactions = db.prepare('SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC').all(wallet.id);

    res.json({ balance: wallet.balance, transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet info' });
  }
});

// Add Funds to Wallet (Simulated top up)
router.post('/add-funds', authenticateToken, (req, res) => {
  try {
    const { amount } = req.body;
    const addAmt = Number(amount);

    if (!addAmt || addAmt <= 0) {
      return res.status(400).json({ error: 'Enter a valid amount to add' });
    }

    let wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
    if (!wallet) {
      db.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, 0.0)').run(req.user.id);
      wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(req.user.id);
    }

    db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(addAmt, wallet.id);

    db.prepare(`
      INSERT INTO wallet_transactions (wallet_id, type, amount, description)
      VALUES (?, 'credit', ?, ?)
    `).run(wallet.id, addAmt, 'Simulated Online Wallet Recharge');

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'success')
    `).run(req.user.id, 'Wallet Recharged', `₹${addAmt} added to your CanteenX wallet successfully!`, 'success');

    const updatedWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(wallet.id);
    const transactions = db.prepare('SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC').all(wallet.id);

    res.json({ balance: updatedWallet.balance, transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add funds' });
  }
});

export default router;

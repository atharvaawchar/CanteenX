import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate CX token
function generateTokenNumber() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CX-${num}`;
}

// Create / Checkout Order
router.post('/checkout', authenticateToken, (req, res) => {
  try {
    const { items, slot_id, slot_time, payment_method, notes } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!slot_time) {
      return res.status(400).json({ error: 'Pickup slot selection is required' });
    }

    // Verify slot capacity if slot_id provided
    let slotObj = null;
    if (slot_id) {
      slotObj = db.prepare('SELECT * FROM pickup_slots WHERE id = ?').get(slot_id);
    } else {
      slotObj = db.prepare('SELECT * FROM pickup_slots WHERE slot_time = ?').get(slot_time);
    }

    if (slotObj && slotObj.booked_count >= slotObj.capacity) {
      return res.status(400).json({ error: `Selected slot (${slot_time}) is full. Please select another slot.` });
    }

    // Calculate total & verify stock
    let totalAmount = 0;
    const itemDetails = [];

    for (const cartItem of items) {
      const foodItem = db.prepare('SELECT * FROM food_items WHERE id = ?').get(cartItem.id);
      if (!foodItem) {
        return res.status(400).json({ error: `Item ${cartItem.name} not found` });
      }

      if (foodItem.stock < cartItem.quantity || foodItem.availability === 'Sold Out') {
        return res.status(400).json({ error: `${foodItem.name} is currently Sold Out or has insufficient stock.` });
      }

      const itemTotal = foodItem.price * cartItem.quantity;
      totalAmount += itemTotal;

      itemDetails.push({
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: cartItem.quantity,
        currentStock: foodItem.stock
      });
    }

    // Handle Wallet Payment
    if (payment_method === 'WALLET') {
      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ error: `Insufficient Wallet Balance (₹${wallet ? wallet.balance : 0}). Please top up your wallet or choose another payment method.` });
      }

      // Deduct wallet
      db.prepare('UPDATE wallets SET balance = balance - ? WHERE id = ?').run(totalAmount, wallet.id);
      db.prepare(`
        INSERT INTO wallet_transactions (wallet_id, type, amount, description)
        VALUES (?, 'debit', ?, ?)
      `).run(wallet.id, totalAmount, `Payment for Order Pre-order`);
    }

    // Generate Order Token & Record
    let orderNumber = generateTokenNumber();
    while (db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderNumber)) {
      orderNumber = generateTokenNumber();
    }

    const qrCode = `CANTEENX-ORDER-${orderNumber}-${Date.now()}`;

    const insertOrder = db.prepare(`
      INSERT INTO orders (order_number, user_id, pickup_slot_id, slot_time, total_amount, payment_method, payment_status, status, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, 'PAID', 'ORDER_PLACED', ?)
    `);

    const orderResult = insertOrder.run(
      orderNumber,
      userId,
      slotObj ? slotObj.id : null,
      slot_time,
      totalAmount,
      payment_method || 'UPI',
      qrCode
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert Order Items & Update Stock
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, food_item_id, item_name, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of itemDetails) {
      insertOrderItem.run(orderId, item.id, item.name, item.price, item.quantity);

      // Deduct stock & increment order count
      const newStock = item.currentStock - item.quantity;
      let newAvailability = 'Available';
      if (newStock <= 0) {
        newAvailability = 'Sold Out';
      } else if (newStock <= 5) {
        newAvailability = 'Only 5 Left';
      }

      db.prepare(`
        UPDATE food_items 
        SET stock = ?, 
            availability = ?, 
            order_count = order_count + ? 
        WHERE id = ?
      `).run(newStock, newAvailability, item.quantity, item.id);
    }

    // Update Slot Booking Count
    if (slotObj) {
      db.prepare('UPDATE pickup_slots SET booked_count = booked_count + 1 WHERE id = ?').run(slotObj.id);
    }

    // Add Confirmation Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'success')
    `).run(
      userId,
      `Order Placed (${orderNumber})`,
      `Your order for pickup at ${slot_time} is confirmed! Token: ${orderNumber}`,
    );

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const createdItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    const fullOrder = { ...createdOrder, items: createdItems };

    // Realtime notification to admin/kitchen
    req.io?.emit('new_order', fullOrder);

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get My Orders (Student)
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    const result = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// Admin: Get All Orders
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.name as student_name, u.student_id as student_prn, u.department
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

    const result = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// Get Order Details by ID or Token
router.get('/:tokenOrId', authenticateToken, (req, res) => {
  try {
    const param = req.params.tokenOrId;
    let order;
    if (!isNaN(param)) {
      order = db.prepare('SELECT o.*, u.name as student_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(param);
    } else {
      order = db.prepare('SELECT o.*, u.name as student_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.order_number = ?').get(param);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Admin/Kitchen: Update Order Status
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body; // ACCEPTED, PREPARING, READY, COLLECTED, CANCELLED
    const validStatuses = ['ORDER_PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
    const updatedOrder = { ...order, items };

    // Send notifications based on status
    if (status === 'ACCEPTED') {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'info')
      `).run(order.user_id, `Order Accepted`, `Your order ${order.order_number} has been accepted by the kitchen.`, 'info');
    } else if (status === 'PREPARING') {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'info')
      `).run(order.user_id, `Order Preparing`, `Your food for ${order.order_number} is being freshly prepared!`, 'info');
    } else if (status === 'READY') {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'success')
      `).run(order.user_id, `Order READY! 🎉`, `Your order ${order.order_number} is READY! Proceed to Pickup Counter 2.`, 'success');
    } else if (status === 'COLLECTED') {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'success')
      `).run(order.user_id, `Order Collected`, `Order ${order.order_number} has been collected. Enjoy your meal!`, 'success');
    }

    // Emit live status event
    req.io?.emit('order_status_changed', updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin: Verify Token / QR code & mark collected
router.post('/scan', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { tokenNumber } = req.body;
    if (!tokenNumber) {
      return res.status(400).json({ error: 'Token number or QR text is required' });
    }

    // Clean up input token (e.g., if user pastes CX-1042 or full QR string)
    let searchToken = tokenNumber.trim();
    if (searchToken.includes('CANTEENX-ORDER-')) {
      const parts = searchToken.split('-');
      searchToken = `${parts[2]}-${parts[3]}`;
    }

    const order = db.prepare(`
      SELECT o.*, u.name as student_name, u.student_id as student_prn
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.order_number = ? OR o.qr_code = ?
    `).get(searchToken, tokenNumber);

    if (!order) {
      return res.status(404).json({ error: 'No matching order found for this Token / QR code.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    res.json({
      found: true,
      order: { ...order, items }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error scanning token' });
  }
});

export default router;

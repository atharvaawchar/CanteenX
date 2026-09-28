import bcrypt from 'bcryptjs';
import db, { initDb } from '../config/db.js';

export function seedData() {
  initDb();

  // Clear existing data
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM wallet_transactions;
    DELETE FROM wallets;
    DELETE FROM table_reservations;
    DELETE FROM tables;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM pickup_slots;
    DELETE FROM food_items;
    DELETE FROM categories;
    DELETE FROM notifications;
    DELETE FROM announcements;
    DELETE FROM users;
  `);

  console.log('Seeding initial data...');

  // Create Users
  const studentPassword = bcrypt.hashSync('student123', 10);
  const adminPassword = bcrypt.hashSync('admin123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, student_id, department, year, password, role, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const studentResult = insertUser.run(
    'Atharva Deshmukh',
    'student@canteenx.demo',
    'PRN-2024-8921',
    'Computer Engineering',
    'Final Year',
    studentPassword,
    'student',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  );
  const studentId = studentResult.lastInsertRowid;

  insertUser.run(
    'Chief Canteen Admin',
    'admin@canteenx.demo',
    'STAFF-001',
    'Canteen Administration',
    'Staff',
    adminPassword,
    'admin',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'
  );

  // Setup Wallet for Student
  const insertWallet = db.prepare(`INSERT INTO wallets (user_id, balance) VALUES (?, ?)`);
  const walletResult = insertWallet.run(studentId, 450.0);
  const walletId = walletResult.lastInsertRowid;

  const insertTx = db.prepare(`INSERT INTO wallet_transactions (wallet_id, type, amount, description) VALUES (?, ?, ?, ?)`);
  insertTx.run(walletId, 'credit', 500.0, 'Initial Campus Wallet Recharge');
  insertTx.run(walletId, 'debit', 50.0, 'Order #CX-1010 - Cold Coffee');

  // Create Categories
  const categoriesData = [
    { name: 'Breakfast', icon: 'SunMedium', slug: 'breakfast' },
    { name: 'Meals', icon: 'UtensilsCrossed', slug: 'meals' },
    { name: 'Snacks', icon: 'Cookie', slug: 'snacks' },
    { name: 'Beverages', icon: 'Coffee', slug: 'beverages' },
    { name: 'Healthy', icon: 'Salad', slug: 'healthy' },
    { name: 'Desserts', icon: 'Cake', slug: 'desserts' }
  ];

  const insertCategory = db.prepare(`INSERT INTO categories (name, icon, slug) VALUES (?, ?, ?)`);
  const categoryIds = {};
  for (const cat of categoriesData) {
    const res = insertCategory.run(cat.name, cat.icon, cat.slug);
    categoryIds[cat.slug] = res.lastInsertRowid;
  }

  // Create Food Items
  const foodItems = [
    {
      category_id: categoryIds['snacks'],
      name: 'Veg Sandwich',
      description: 'Fresh toasted sandwich loaded with sliced cucumber, tomato, onion and mint chutney.',
      price: 60,
      stock: 25,
      prep_time: 8,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.6,
      order_count: 140,
      is_special: 0
    },
    {
      category_id: categoryIds['snacks'],
      name: 'Cheese Sandwich',
      description: 'Gooey melted mozzarella and cheddar cheese toasted to golden perfection.',
      price: 80,
      stock: 18,
      prep_time: 8,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      availability: 'Selling Fast',
      rating: 4.8,
      order_count: 210,
      is_special: 1
    },
    {
      category_id: categoryIds['snacks'],
      name: 'Veg Burger',
      description: 'Crispy potato patty with fresh lettuce, tomatoes and signature spiced mayo in a toasted bun.',
      price: 70,
      stock: 15,
      prep_time: 10,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.5,
      order_count: 320,
      is_special: 0
    },
    {
      category_id: categoryIds['snacks'],
      name: 'Paneer Burger',
      description: 'Rich grilled paneer patty topped with crunchy veggies and house special sauce.',
      price: 90,
      stock: 5,
      prep_time: 12,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      availability: 'Only 5 Left',
      rating: 4.7,
      order_count: 185,
      is_special: 1
    },
    {
      category_id: categoryIds['snacks'],
      name: 'French Fries',
      description: 'Golden salted crispy potato fries served with tomato ketchup.',
      price: 60,
      stock: 30,
      prep_time: 6,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.4,
      order_count: 450,
      is_special: 0
    },
    {
      category_id: categoryIds['meals'],
      name: 'Veg Thali',
      description: 'Complete meal with 2 Roti, Paneer Sabzi, Dal Tadka, Jeera Rice, Salad, and Gulab Jamun.',
      price: 120,
      stock: 0,
      prep_time: 15,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      availability: 'Sold Out',
      rating: 4.9,
      order_count: 510,
      is_special: 1
    },
    {
      category_id: categoryIds['meals'],
      name: 'Paneer Rice Bowl',
      description: 'Flavorful basmati jeera rice served with creamy Shahi Paneer gravy.',
      price: 110,
      stock: 12,
      prep_time: 10,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.7,
      order_count: 290,
      is_special: 0
    },
    {
      category_id: categoryIds['breakfast'],
      name: 'Masala Dosa',
      description: 'Crispy fermented rice crepe filled with spiced potato masala, served with coconut chutney & sambar.',
      price: 70,
      stock: 20,
      prep_time: 10,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.8,
      order_count: 380,
      is_special: 0
    },
    {
      category_id: categoryIds['breakfast'],
      name: 'Idli Sambar',
      description: 'Three steamed rice cakes served hot with piping spicy sambar and coconut chutney.',
      price: 60,
      stock: 22,
      prep_time: 5,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.6,
      order_count: 240,
      is_special: 0
    },
    {
      category_id: categoryIds['breakfast'],
      name: 'Kanda Poha',
      description: 'Flattened rice tempered with mustard seeds, curry leaves, peanuts, onions and lemon.',
      price: 40,
      stock: 25,
      prep_time: 4,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1644368146740-424d8525b68f?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.5,
      order_count: 410,
      is_special: 0
    },
    {
      category_id: categoryIds['snacks'],
      name: 'Samosa (2 pcs)',
      description: 'Deep-fried pastry filled with spiced potato and pea mixture, served with tamarind chutney.',
      price: 20,
      stock: 40,
      prep_time: 3,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.7,
      order_count: 620,
      is_special: 0
    },
    {
      category_id: categoryIds['beverages'],
      name: 'Cold Coffee',
      description: 'Chilled creamy blended coffee topped with chocolate syrup and cocoa powder.',
      price: 50,
      stock: 35,
      prep_time: 5,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.9,
      order_count: 550,
      is_special: 1
    },
    {
      category_id: categoryIds['beverages'],
      name: 'Masala Tea',
      description: 'Hot fragrant Indian milk tea brewed with cardamom, ginger, and aromatic spices.',
      price: 15,
      stock: 50,
      prep_time: 3,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.8,
      order_count: 890,
      is_special: 0
    },
    {
      category_id: categoryIds['beverages'],
      name: 'Filter Coffee',
      description: 'Traditional South Indian hot brass filter brewed milk coffee.',
      price: 25,
      stock: 30,
      prep_time: 3,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.7,
      order_count: 310,
      is_special: 0
    },
    {
      category_id: categoryIds['beverages'],
      name: 'Fresh Lime Soda',
      description: 'Refreshing sweet & salted sparkling lemon drink served iced.',
      price: 40,
      stock: 40,
      prep_time: 4,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.6,
      order_count: 220,
      is_special: 0
    },
    {
      category_id: categoryIds['healthy'],
      name: 'Fruit Bowl',
      description: 'Assorted seasonal fresh cut fruits topped with chia seeds and honey.',
      price: 80,
      stock: 10,
      prep_time: 5,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.8,
      order_count: 110,
      is_special: 0
    },
    {
      category_id: categoryIds['healthy'],
      name: 'Sprouted Moong Salad',
      description: 'Steamed green gram sprouts with diced cucumber, tomatoes, pomegranates & tangy dressing.',
      price: 60,
      stock: 14,
      prep_time: 4,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.5,
      order_count: 95,
      is_special: 0
    },
    {
      category_id: categoryIds['desserts'],
      name: 'Chocolate Brownie',
      description: 'Warm fudge chocolate brownie loaded with roasted walnuts and chocolate glaze.',
      price: 75,
      stock: 15,
      prep_time: 3,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.9,
      order_count: 280,
      is_special: 1
    },
    {
      category_id: categoryIds['desserts'],
      name: 'Mango Lassi',
      description: 'Thick creamy yogurt smoothie blended with Alphonso mango pulp.',
      price: 60,
      stock: 20,
      prep_time: 4,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
      availability: 'Available',
      rating: 4.8,
      order_count: 310,
      is_special: 0
    },
    {
      category_id: categoryIds['meals'],
      name: 'White Sauce Pasta',
      description: 'Penne pasta tossed in rich creamy garlic Bechamel sauce with bell peppers and sweet corn.',
      price: 110,
      stock: 8,
      prep_time: 12,
      is_veg: 1,
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3def6166739?auto=format&fit=crop&w=600&q=80',
      availability: 'Selling Fast',
      rating: 4.7,
      order_count: 175,
      is_special: 0
    }
  ];

  const insertFood = db.prepare(`
    INSERT INTO food_items (category_id, name, description, price, stock, prep_time, is_veg, image_url, availability, rating, order_count, is_special)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of foodItems) {
    insertFood.run(
      item.category_id,
      item.name,
      item.description,
      item.price,
      item.stock,
      item.prep_time,
      item.is_veg,
      item.image_url,
      item.availability,
      item.rating,
      item.order_count,
      item.is_special
    );
  }

  // Create Pickup Slots
  const slots = [
    { slot_time: '12:15 PM – 12:20 PM', capacity: 10, booked: 6 },
    { slot_time: '12:20 PM – 12:25 PM', capacity: 10, booked: 8 },
    { slot_time: '12:25 PM – 12:30 PM', capacity: 10, booked: 9 },
    { slot_time: '12:30 PM – 12:35 PM', capacity: 10, booked: 10 }, // Full slot demo!
    { slot_time: '12:35 PM – 12:40 PM', capacity: 10, booked: 7 },
    { slot_time: '12:40 PM – 12:45 PM', capacity: 10, booked: 3 },
    { slot_time: '12:45 PM – 12:50 PM', capacity: 10, booked: 2 },
    { slot_time: '12:50 PM – 12:55 PM', capacity: 10, booked: 1 },
    { slot_time: '12:55 PM – 1:00 PM', capacity: 10, booked: 0 }
  ];

  const insertSlot = db.prepare(`INSERT INTO pickup_slots (slot_time, capacity, booked_count) VALUES (?, ?, ?)`);
  const slotIds = {};
  for (const s of slots) {
    const res = insertSlot.run(s.slot_time, s.capacity, s.booked);
    slotIds[s.slot_time] = res.lastInsertRowid;
  }

  // Create 20 Tables
  const tableStatuses = [
    'AVAILABLE', 'OCCUPIED', 'AVAILABLE', 'RESERVED', 'OCCUPIED',
    'AVAILABLE', 'OCCUPIED', 'CLEANING', 'AVAILABLE', 'OCCUPIED',
    'OCCUPIED', 'AVAILABLE', 'RESERVED', 'OCCUPIED', 'AVAILABLE',
    'CLEANING', 'OCCUPIED', 'AVAILABLE', 'OCCUPIED', 'AVAILABLE'
  ];

  const insertTable = db.prepare(`INSERT INTO tables (table_number, seats, status) VALUES (?, ?, ?)`);
  for (let i = 1; i <= 20; i++) {
    const num = `T${i < 10 ? '0' + i : i}`;
    const seats = i % 3 === 0 ? 6 : (i % 2 === 0 ? 2 : 4);
    const status = tableStatuses[i - 1];
    insertTable.run(num, seats, status);
  }

  // Create Active Order for Student
  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, user_id, pickup_slot_id, slot_time, total_amount, payment_method, payment_status, status, qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const activeOrderRes = insertOrder.run(
    'CX-1042',
    studentId,
    slotIds['12:35 PM – 12:40 PM'],
    '12:35 PM – 12:40 PM',
    120.0,
    'UPI',
    'PAID',
    'PREPARING',
    'CX-1042-AUTH-TOKEN-2026'
  );
  const activeOrderId = activeOrderRes.lastInsertRowid;

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, food_item_id, item_name, price, quantity)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertOrderItem.run(activeOrderId, 3, 'Veg Burger', 70.0, 1);
  insertOrderItem.run(activeOrderId, 12, 'Cold Coffee', 50.0, 1);

  // Past Completed Order for Student
  const pastOrderRes = insertOrder.run(
    'CX-1010',
    studentId,
    slotIds['12:15 PM – 12:20 PM'],
    '12:15 PM – 12:20 PM',
    50.0,
    'WALLET',
    'PAID',
    'COLLECTED',
    'CX-1010-AUTH-TOKEN'
  );
  insertOrderItem.run(pastOrderRes.lastInsertRowid, 12, 'Cold Coffee', 50.0, 1);

  // Notifications for Student
  const insertNotif = db.prepare(`INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`);
  insertNotif.run(studentId, 'Order Confirmed', 'Your order CX-1042 has been accepted and sent to kitchen.', 'success');
  insertNotif.run(studentId, 'Food Preparation Started', 'Your Veg Burger & Cold Coffee are being freshly prepared!', 'info');
  insertNotif.run(studentId, 'Low Stock Alert', 'Only 5 Paneer Burgers remaining for lunch break today.', 'warning');

  // Announcements
  const insertAnnounce = db.prepare(`INSERT INTO announcements (message) VALUES (?)`);
  insertAnnounce.run('⚡ Special Discount: Cold Coffee + Burger Combo at ₹110 only!');
  insertAnnounce.run('📢 Counter 2 is dedicated for Fast Pre-order Token collection today.');

  // Reviews
  const insertReview = db.prepare(`INSERT INTO reviews (food_item_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)`);
  insertReview.run(3, studentId, 'Atharva D.', 5, 'Crispy patty and very fast pickup! Saved me 15 mins.');
  insertReview.run(12, studentId, 'Atharva D.', 5, 'Best cold coffee on campus.');

  console.log('Seeding completed successfully!');
}

if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedData();
}

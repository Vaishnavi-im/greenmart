const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'greenmart_secret_key_2024';
const DB_FILE = './db.json';

// INITIALIZE DB
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    products: [
      { id: 1, name: 'Organic Broccoli', price: 49, originalPrice: 65, category: 'vegetables', emoji: '🥦', stock: 100, rating: 5, reviews: 24, badge: 'Organic' },
      { id: 2, name: 'Red Apples', price: 120, originalPrice: 150, category: 'fruits', emoji: '🍎', stock: 80, rating: 5, reviews: 18, badge: 'Fresh' },
      { id: 3, name: 'Organic Carrots', price: 35, originalPrice: 50, category: 'vegetables', emoji: '🥕', stock: 120, rating: 4, reviews: 15, badge: 'Local' },
      { id: 4, name: 'Fresh Lemons', price: 30, originalPrice: 40, category: 'fruits', emoji: '🍋', stock: 90, rating: 5, reviews: 20, badge: 'Organic' },
      { id: 5, name: 'Raw Honey', price: 299, originalPrice: 350, category: 'honey', emoji: '🍯', stock: 50, rating: 5, reviews: 45, badge: 'Organic' },
      { id: 6, name: 'Spinach Leaves', price: 25, originalPrice: 35, category: 'vegetables', emoji: '🥬', stock: 100, rating: 4, reviews: 12, badge: 'Fresh' },
      { id: 7, name: 'Cherry Tomatoes', price: 60, originalPrice: 80, category: 'vegetables', emoji: '🍅', stock: 75, rating: 5, reviews: 30, badge: 'Organic' },
      { id: 8, name: 'Blueberries', price: 180, originalPrice: 220, category: 'fruits', emoji: '🫐', stock: 40, rating: 5, reviews: 22, badge: 'Fresh' }
    ],
    orders: []
  }));
}

// READ DB
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// WRITE DB
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ============ AUTH ROUTES ============

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const db = readDB();
    const { firstName, lastName, email, phone, password, gender } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const exists = db.users.find(u => u.email === email);
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now(),
      firstName, lastName, email,
      phone, password: hashed, gender,
      role: 'user',
      walletBalance: 0,
      loyaltyPoints: 0
    };

    db.users.push(user);
    writeDB(db);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '✅ Account created successfully!',
      token,
      user: { id: user.id, firstName, email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = readDB();
    const { email, password } = req.body;

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '✅ Login successful!',
      token,
      user: { id: user.id, firstName: user.firstName, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============ PRODUCT ROUTES ============

// GET ALL PRODUCTS
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json({ count: db.products.length, products: db.products });
});

// GET SINGLE PRODUCT
app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id == req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// CREATE PRODUCT
app.post('/api/products', (req, res) => {
  const db = readDB();
  const product = { id: Date.now(), ...req.body };
  db.products.push(product);
  writeDB(db);
  res.status(201).json({ message: '✅ Product created!', product });
});

// UPDATE PRODUCT
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const index = db.products.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Not found' });
  db.products[index] = { ...db.products[index], ...req.body };
  writeDB(db);
  res.json({ message: '✅ Product updated!', product: db.products[index] });
});

// DELETE PRODUCT
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id != req.params.id);
  writeDB(db);
  res.json({ message: '✅ Product deleted!' });
});

// ============ ORDER ROUTES ============

// CREATE ORDER
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const order = {
    id: Date.now(),
    orderId: 'GM' + Date.now(),
    ...req.body,
    orderStatus: 'placed',
    createdAt: new Date()
  };
  db.orders.push(order);
  writeDB(db);
  res.status(201).json({ message: '✅ Order placed!', order });
});

// GET ALL ORDERS
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json({ count: db.orders.length, orders: db.orders });
});

// GET USER ORDERS
app.get('/api/orders/user/:userId', (req, res) => {
  const db = readDB();
  const orders = db.orders.filter(o => o.userId == req.params.userId);
  res.json({ count: orders.length, orders });
});

// HOME ROUTE
app.get('/', (req, res) => {
  res.json({ message: '🌿 GreenMart API is running!' });
});

// START SERVER
app.listen(5000, () => {
  console.log('✅ GreenMart Server running on http://localhost:5000');
  console.log('✅ Database: JSON File (db.json)');
});
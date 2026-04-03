const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

const ADMIN_SEED = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@growin.app',
  password: 'admin123',
  role: 'admin',
  riskProfile: null,
  isLoggedIn: false,
  joinedAt: '2025-01-01T00:00:00.000Z',
};

const EMPTY_USER_DATA = {
  walletBalance: 0,
  expenses: [],
  investments: [],
  goals: [],
  transactions: [],
  lastPLUpdate: null,
};

const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: [ADMIN_SEED],
      funds: [],
      userData: {
        'admin-001': { ...EMPTY_USER_DATA }
      }
    }, null, 2));
  }
};
initDB();

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// GET Full App State Initialization
app.get('/api/init', (req, res) => {
  const db = readDB();
  res.json({ users: db.users, funds: db.funds });
});

// AUTH
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const db = readDB();
  
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'This email is already registered. Try logging in.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
    riskProfile: null,
    isLoggedIn: true,
    joinedAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  db.userData[newUser.id] = { ...EMPTY_USER_DATA };
  writeDB(db);
  
  res.json({ 
    success: true, 
    message: `Welcome to GroWin, ${newUser.name}! 🎉`, 
    user: newUser, 
    users: db.users // Return all users so AppContext updates its local list
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  
  if (!user) return res.status(400).json({ success: false, message: 'Incorrect email or password. Please try again.' });
  if (user.role !== role) {
    return res.status(400).json({ success: false, message: `This account is not registered as a ${role}.` });
  }
  
  res.json({ success: true, message: `Welcome back, ${user.name}! 👋`, user });
});

// USERS DB
app.put('/api/users', (req, res) => {
  const db = readDB();
  db.users = req.body;
  writeDB(db);
  res.json({ success: true });
});

// FUNDS DB
app.put('/api/funds', (req, res) => {
  const db = readDB();
  db.funds = req.body;
  writeDB(db);
  res.json({ success: true });
});

// USER DATA DB
app.get('/api/userData/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.userData[id]) {
    db.userData[id] = { ...EMPTY_USER_DATA };
    writeDB(db);
  }
  res.json(db.userData[id]);
});

app.put('/api/userData/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.userData[id] = req.body;
  writeDB(db);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});

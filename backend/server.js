require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const startSelfPing = require('./utils/selfPing');
const { autoSeedIfEmpty } = require('./services/seedService');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*') {
      return callback(null, process.env.FRONTEND_URL);
    }
    callback(null, origin);
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/timetable',  require('./routes/timetable'));
app.use('/api/notices',    require('./routes/notices'));
app.use('/api/inquiries',  require('./routes/inquiries'));
app.use('/api/toppers',          require('./routes/toppers'));
app.use('/api/dashboard',        require('./routes/dashboard'));
app.use('/api/teachers',         require('./routes/teachers'));
app.use('/api/teacher-payments', require('./routes/teacherPayments'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'New Perfect Tution Classes API is running 🚀' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ─── DB & Server Startup ──────────────────────────────────────────────────────
async function startServer() {
  const isDBConnected = await connectDB();

  if (isDBConnected) {
    await autoSeedIfEmpty();
  }

  app.listen(PORT, () => {
    const mode = isDBConnected ? 'MongoDB Connected' : 'Standalone mode';
    console.log(`🚀 Server running on port ${PORT} (${mode})`);
    startSelfPing();
  });
}

startServer();

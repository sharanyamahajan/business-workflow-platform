const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { seedDatabase } = require('./db/seed');

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Enable CORS with environment configurable allowed origin
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded attachments securely
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Seed database on startup if required
try {
  seedDatabase();
} catch (err) {
  console.error('Error seeding database:', err);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'Business Workflow Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`=================================================`);
    console.log(` Business Workflow Platform Backend Active       `);
    console.log(` PORT: ${config.PORT}                             `);
    console.log(` CLIENT_URL: ${process.env.CLIENT_URL || '*'}     `);
    console.log(`=================================================`);
  });
}

module.exports = app;

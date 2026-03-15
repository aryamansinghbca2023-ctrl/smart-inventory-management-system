require('express-async-errors');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDB = require('./seed/seed');
const User = require('./models/User');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Ensure DB is connected for serverless invocations on Vercel
app.use(async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  }
  next();
});

app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/users',      require('./routes/user.routes'));
app.use('/api/products',   require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/requests',   require('./routes/request.routes'));
app.use('/api/reports',    require('./routes/report.routes'));
app.use('/api/logs',       require('./routes/auditlog.routes'));
app.use('/api/settings',   require('./routes/settings.routes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  const startServer = async () => {
    try {
      await connectDB();
      
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Database is empty. Auto-seeding...');
        await seedDB();
      }
  
      app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}



// Export the app for Vercel Serverless Functions
module.exports = app;

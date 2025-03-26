const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const connectToMongo = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - more permissive for development
app.use(cors({
  origin: true, // Allow all origins during development
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));

// Email Schema
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Email = mongoose.model('Email', emailSchema);

// POST /signup endpoint
app.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const email = req.body.email;
  
  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const newEmail = new Email({ email });
    await newEmail.save();
    console.log('Email successfully registered:', email);
    res.json({ message: 'Email saved successfully!' });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Error saving email' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add endpoint to check emails
app.get('/check-emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json({ emails: emails.map(e => e.email) });
  } catch (error) {
    console.error('Error reading emails:', error);
    res.status(500).json({ error: 'Error reading emails' });
  }
});

// Connect to MongoDB and start server
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});


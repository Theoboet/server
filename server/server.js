const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string.mongodb.net/';
const client = new MongoClient(uri);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: true,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// POST /signup endpoint
app.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const email = req.body.email;
  
  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const database = client.db('interactive');
    const emails = database.collection('emails');
    
    // Check if email already exists
    const existingEmail = await emails.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Insert new email
    await emails.insertOne({ 
      email: email,
      timestamp: new Date()
    });
    
    console.log('Email successfully registered:', email);
    res.json({ message: 'Email saved successfully!' });
  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ error: 'Error saving email' });
  }
});

// GET /check-emails endpoint
app.get('/check-emails', async (req, res) => {
  try {
    const database = client.db('interactive');
    const emails = database.collection('emails');
    
    const allEmails = await emails.find({}).toArray();
    res.json({ emails: allEmails.map(e => e.email) });
  } catch (error) {
    console.error('Error reading emails:', error);
    res.status(500).json({ error: 'Error reading emails' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB and start server
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});


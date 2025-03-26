const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

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

// POST /signup endpoint
app.post('/signup', (req, res) => {
  console.log('Received signup request:', req.body);
  const email = req.body.email;
  
  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  // Use absolute path for emails.txt
  const emailsPath = path.join(__dirname, 'emails.txt');
  
  fs.appendFile(emailsPath, email + '\n', (err) => {
    if (err) {
      console.error('Error saving email:', err);
      return res.status(500).json({ error: 'Error saving email' });
    }
    console.log('Email registered:', email);
    res.json({ message: 'Email saved successfully!' });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


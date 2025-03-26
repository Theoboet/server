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

// Ensure emails.txt exists
const emailsPath = path.join(__dirname, 'emails.txt');
if (!fs.existsSync(emailsPath)) {
  fs.writeFileSync(emailsPath, '', 'utf8');
  console.log('Created emails.txt file');
}

// POST /signup endpoint
app.post('/signup', (req, res) => {
  console.log('Received signup request:', req.body);
  const email = req.body.email;
  
  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  console.log('Attempting to save email to:', emailsPath);
  
  fs.appendFile(emailsPath, email + '\n', 'utf8', (err) => {
    if (err) {
      console.error('Error saving email:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        path: emailsPath
      });
      return res.status(500).json({ error: 'Error saving email' });
    }
    console.log('Email successfully registered:', email);
    res.json({ message: 'Email saved successfully!' });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add endpoint to check emails file
app.get('/check-emails', (req, res) => {
  fs.readFile(emailsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading emails file:', err);
      return res.status(500).json({ error: 'Error reading emails file' });
    }
    res.json({ emails: data.split('\n').filter(email => email.trim()) });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Emails file location:', emailsPath);
});


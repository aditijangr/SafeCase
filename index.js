const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Use the authentication routes
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

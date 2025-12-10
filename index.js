require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const db = require('./db'); // Import the new db module

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Connect to the database when the application starts
db.connect().catch(err => {
    console.error('Database Connection Failed on startup!', err);
    process.exit(1); // Exit the process if DB connection fails
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/toppicks', require('./routes/topPicks'));
app.use('/api/contact-us', require('./routes/contactUs'));
app.use('/api/about-us', require('./routes/aboutUs'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/favourites', require('./routes/favourites'));
app.use('/api/settings', require('./routes/settings'));

app.get('/', (req, res) => {
    res.send('Hello from the Gold Price Comparison API!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

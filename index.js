require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Connect to the database when the application starts
db.connect().catch(err => {
    console.error('Database Connection Failed on startup!', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/toppicks', require('./routes/topPicks'));
app.use('/api/contact-us', require('./routes/contactUs'));
app.use('/api/about-us', require('./routes/aboutUs'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/favourites', require('./routes/favourites'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/visitor-stats', require('./routes/visitorStats'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/inquiries', require('./routes/inquiries'));


app.get('/', (req, res) => {
    res.send('Hello from the Gold Price Comparison API!');
});

// Start the server
const PORT = process.env.PORT || process.env.API_PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
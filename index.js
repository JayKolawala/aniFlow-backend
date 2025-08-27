const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const AnimeRouter = require('./Routes/AnimeRouter');
const StatsRouter = require('./Routes/StatsRouter');
require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors(
    origin = process.env.CLIENT_URL || 'http://localhost:3000',
    methods = ['GET', 'POST', 'PUT', 'DELETE'],
    credentials = true

));

// Add request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Routes
app.use('/auth', AuthRouter);
app.use('/api/anime', AnimeRouter);
app.use('/api/stats', StatsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

module.exports = app;
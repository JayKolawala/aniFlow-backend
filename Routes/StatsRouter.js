const express = require('express');
const router = express.Router();
const StatsController = require('../Controllers/StatsController');
const verifyToken = require('../Middlewares/verifyToken');

// Public route for dashboard stats
router.get('/dashboard', StatsController.getDashboardStats);

// Protected routes (require authentication)
router.get('/user', verifyToken, StatsController.getUserStats);
router.get('/trending', StatsController.getTrendingAnime);

module.exports = router;
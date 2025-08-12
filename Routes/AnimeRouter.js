const express = require('express');
const router = express.Router();
const AnimeController = require('../Controllers/AnimeController');
const verifyToken = require('../Middlewares/verifyToken');

// All routes require authentication
router.use(verifyToken);

// Update anime status (add to list or change status)
router.post('/status', AnimeController.updateAnimeStatus);

// Get user's anime lists
router.get('/lists', AnimeController.getUserAnimeLists);

// Remove from specific list
router.delete('/remove', AnimeController.removeFromList);

module.exports = router;
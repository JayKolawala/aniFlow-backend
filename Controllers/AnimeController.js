const User = require('../Models/User');

// Update anime status for user
exports.updateAnimeStatus = async (req, res) => {
    try {
        const { animeId, status } = req.body;
        const userId = req.user._id;

        if (!animeId) {
            return res.status(400).json({
                success: false,
                message: 'Anime ID is required'
            });
        }

        // Remove from all lists first
        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    'animeLists.watching': { animeId },
                    'animeLists.completed': { animeId },
                    'animeLists.planToWatch': { animeId },
                    'animeLists.onHold': { animeId },
                    'animeLists.dropped': { animeId }
                }
            }
        );

        // Add to new status if provided
        if (status) {
            const updateData = {
                animeId,
                addedDate: new Date()
            };

            // Add specific fields based on status
            if (status === 'completed') {
                updateData.completedDate = new Date();
            } else if (status === 'dropped') {
                updateData.droppedDate = new Date();
            }

            await User.findByIdAndUpdate(
                userId,
                {
                    $addToSet: {
                        [`animeLists.${status}`]: updateData
                    }
                }
            );
        }

        // Get updated user data
        const updatedUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message: status ? `Added to ${status}` : 'Removed from list',
            animeLists: updatedUser.animeLists
        });
    } catch (err) {
        console.error('Error updating anime status:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's anime lists
exports.getUserAnimeLists = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('animeLists');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            animeLists: user.animeLists
        });
    } catch (err) {
        console.error('Error getting anime lists:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Remove anime from specific list
exports.removeFromList = async (req, res) => {
    try {
        const { animeId, status } = req.body;
        const userId = req.user._id;

        if (!animeId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Anime ID and status are required'
            });
        }

        await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    [`animeLists.${status}`]: { animeId }
                }
            }
        );

        // Get updated user data
        const updatedUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message: 'Removed from list',
            animeLists: updatedUser.animeLists
        });
    } catch (err) {
        console.error('Error removing from list:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
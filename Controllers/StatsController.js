// Controllers/StatsController.js
const User = require('../Models/User');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get total users count (Active Users)
        const totalUsers = await User.countDocuments();

        // Get all users with their anime lists to calculate statistics
        const users = await User.find({}, 'animeLists joinedDate').lean();

        // Calculate total anime entries across all users
        let totalAnimeEntries = 0;
        let totalReviews = 0;

        users.forEach(user => {
            if (user.animeLists) {
                // Count all anime entries across all lists
                totalAnimeEntries += (user.animeLists.watching?.length || 0);
                totalAnimeEntries += (user.animeLists.completed?.length || 0);
                totalAnimeEntries += (user.animeLists.planToWatch?.length || 0);
                totalAnimeEntries += (user.animeLists.onHold?.length || 0);
                totalAnimeEntries += (user.animeLists.dropped?.length || 0);

                // Count reviews (completed anime with ratings)
                if (user.animeLists.completed) {
                    totalReviews += user.animeLists.completed.filter(anime => anime.rating).length;
                }
                if (user.animeLists.dropped) {
                    totalReviews += user.animeLists.dropped.filter(anime => anime.rating).length;
                }
            }
        });

        // Calculate active users (users who joined in last 30 days or have anime in their lists)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = users.filter(user => {
            const hasRecentActivity = user.joinedDate > thirtyDaysAgo;
            const hasAnimeLists = user.animeLists && (
                (user.animeLists.watching?.length > 0) ||
                (user.animeLists.completed?.length > 0) ||
                (user.animeLists.planToWatch?.length > 0) ||
                (user.animeLists.onHold?.length > 0) ||
                (user.animeLists.dropped?.length > 0)
            );
            return hasRecentActivity || hasAnimeLists;
        }).length;

        // Get unique anime count (distinct anime IDs across all users)
        const allAnimeIds = new Set();
        users.forEach(user => {
            if (user.animeLists) {
                ['watching', 'completed', 'planToWatch', 'onHold', 'dropped'].forEach(status => {
                    if (user.animeLists[status]) {
                        user.animeLists[status].forEach(anime => {
                            if (anime.animeId) {
                                allAnimeIds.add(anime.animeId);
                            }
                        });
                    }
                });
            }
        });

        const stats = {
            totalAnimeSeries: allAnimeIds.size,
            activeUsers: activeUsers,
            totalReviews: totalReviews,
            activeCommunity: true, // Always active (24/7)
            // Additional useful stats
            totalUsers: totalUsers,
            totalAnimeEntries: totalAnimeEntries,
            averageAnimePerUser: totalUsers > 0 ? Math.round(totalAnimeEntries / totalUsers) : 0
        };

        res.status(200).json({
            success: true,
            stats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Error getting dashboard stats:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user-specific statistics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('animeLists joinedDate').lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userStats = {
            totalAnime: 0,
            watching: user.animeLists?.watching?.length || 0,
            completed: user.animeLists?.completed?.length || 0,
            planToWatch: user.animeLists?.planToWatch?.length || 0,
            onHold: user.animeLists?.onHold?.length || 0,
            dropped: user.animeLists?.dropped?.length || 0,
            totalReviews: 0,
            averageRating: 0,
            joinedDate: user.joinedDate
        };

        // Calculate total anime and reviews
        ['watching', 'completed', 'planToWatch', 'onHold', 'dropped'].forEach(status => {
            if (user.animeLists && user.animeLists[status]) {
                userStats.totalAnime += user.animeLists[status].length;
            }
        });

        // Calculate reviews and average rating
        let totalRating = 0;
        let ratedAnimeCount = 0;

        ['completed', 'dropped'].forEach(status => {
            if (user.animeLists && user.animeLists[status]) {
                user.animeLists[status].forEach(anime => {
                    if (anime.rating) {
                        userStats.totalReviews++;
                        totalRating += anime.rating;
                        ratedAnimeCount++;
                    }
                });
            }
        });

        if (ratedAnimeCount > 0) {
            userStats.averageRating = Math.round((totalRating / ratedAnimeCount) * 10) / 10;
        }

        res.status(200).json({
            success: true,
            userStats: userStats,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Error getting user stats:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get trending anime (most added to lists recently)
const getTrendingAnime = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const users = await User.find({}, 'animeLists').lean();
        const animeCount = {};

        users.forEach(user => {
            if (user.animeLists) {
                ['watching', 'completed', 'planToWatch', 'onHold', 'dropped'].forEach(status => {
                    if (user.animeLists[status]) {
                        user.animeLists[status].forEach(anime => {
                            if (anime.animeId && anime.addedDate > thirtyDaysAgo) {
                                animeCount[anime.animeId] = (animeCount[anime.animeId] || 0) + 1;
                            }
                        });
                    }
                });
            }
        });

        // Sort by count and get top 10
        const trending = Object.entries(animeCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([animeId, count]) => ({
                animeId,
                count,
                trend: 'up'
            }));

        res.status(200).json({
            success: true,
            trending: trending,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error('Error getting trending anime:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getDashboardStats,
    getUserStats,
    getTrendingAnime
};
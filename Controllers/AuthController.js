const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModal = require("../Models/User");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModal.findOne({ email });

        if (user) {
            return res.status(409)
                .json({ message: "User already exists", success: false });
        }
        const userModal = new UserModal({ name, email, password });
        userModal.password = await bcrypt.hash(password, 10);
        await userModal.save();
        res.status(201)
            .json({
                message: "User created successfully",
                success: true,
            })
    } catch (err) {
        res.status(500)
            .json({ message: "Internal Server Error", success: false });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModal.findOne({ email });
        const ErrorMsg = "Authorization failed, email or password is incorrect";

        const isPasswordEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordEqual) {
            return res.status(403)
                .json({ message: ErrorMsg, success: false });
        }

        const jwtToken = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' }
        )
        res.status(200)
            .json({
                message: "Login successfully",
                success: true,
                jwtToken,
                email,
                name: user.name,
            })
    } catch (err) {
        res.status(500)
            .json({ message: "Internal Server Error", success: false });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, bio, favoriteGenres } = req.body;

        const updatedUser = await UserModal.findByIdAndUpdate(
            userId,
            {
                name,
                email,
                bio,
                favoriteGenres
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                favoriteGenres: updatedUser.favoriteGenres,
                joinedDate: updatedUser.joinedDate,
                animeLists: updatedUser.animeLists
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Controllers/AnimeController.js
exports.addAnime = async (req, res) => {
    try {
        const { animeId, status } = req.body;
        const userId = req.user._id; // From JWT token

        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    [`animeLists.${status}`]: {
                        animeId,
                        addedDate: new Date()
                    }
                }
            }
        );

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// Controllers/AnimeController.js
exports.getUserAnime = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('animeLists');
        res.status(200).json(user.animeLists);
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

module.exports = {
    signup,
    login,
    updateProfile
}
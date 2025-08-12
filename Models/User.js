const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: ''
    },
    favoriteGenres: [{
        type: String
    }],
    joinedDate: {
        type: Date,
        default: Date.now
    },
    animeLists: {
        watching: [{
            animeId: String,
            addedDate: { type: Date, default: Date.now },
            episodesWatched: { type: Number, default: 0 }
        }],
        completed: [{
            animeId: String,
            completedDate: { type: Date, default: Date.now },
            addedDate: { type: Date, default: Date.now },
            rating: Number
        }],
        planToWatch: [{
            animeId: String,
            addedDate: { type: Date, default: Date.now }
        }],
        onHold: [{
            animeId: String,
            addedDate: { type: Date, default: Date.now },
            episodesWatched: { type: Number, default: 0 }
        }],
        dropped: [{
            animeId: String,
            droppedDate: { type: Date, default: Date.now },
            addedDate: { type: Date, default: Date.now },
            rating: Number
        }]
    }
});

const UserModal = mongoose.model('Users', UserSchema);
module.exports = UserModal;
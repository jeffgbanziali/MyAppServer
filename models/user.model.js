const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    fisrtName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
})



module.exports = mongoose.model('user', userSchema);
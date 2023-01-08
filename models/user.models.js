const mongoose = require('mongoose');
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: [true, 'Please enter a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please enter a last name']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']

    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please enter a phone number'],
        minlength: [10, 'Minimum phone number length is 10 characters']
    },

});


const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
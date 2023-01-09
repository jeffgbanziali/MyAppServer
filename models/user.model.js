const mongoose = require('mongoose');
const { isEmail } = require("validator");
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
    fisrtName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        validate: [isEmail],
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 55,
        trimp: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 55,
        trimp: true,

    },
    confirmPassword: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 55,
        trimp: true,
    },
    phoneNumber: {
        type: String
    },
    picture: {

        type: String,
        default: "./uploads/profile/profile.jpg"
    },
    bio: {
        type: String,
        max: 1024
    },
    followers: {
        type: [String],
    },
    following: {
        type: [String],
    },
    likes: {
        type: [String],
    },

},
    {
        timesTamps: true
    }
);

//play function before save into display 

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmassword, salt);
    next();
})



const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
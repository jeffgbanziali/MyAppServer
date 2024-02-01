const mongoose = require('mongoose');
const { isEmail } = require("validator");
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
    pseudo: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 55,
        trimp: true,

    },

    firstName: {
        type: String,

    },
    lastName: {
        type: String,

    },
    email: {
        type: String,
        required: true,
        validate: [isEmail],
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        minlength: 8,
    },
    confirmPassword: {
        type: String,
        required: true,
        max: 1024,
        minlength: 8,
    },
    phoneNumber: {
        type: String
    },
    picture: {

        type: String,
        default: null,
    },
    bio: {
        type: String,
        max: 1024,
    },
    followers: {
        type: [String]
    },
    following: {
        type: [String]
    },
    likes: {
        type: [String]
    },
    favoritePost:
    {
        type: [String]
    },
    savedPost:
    {
        type: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

},
    {
        timestamps: true
    }
);

//play function before save into display 

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
    next();
})

//static method to login user
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect email')
}


userSchema.methods.updatePassword = async function (oldPassword, newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, this.password);
    if (!isMatch) {
        throw new Error('Incorrect old password');
    }

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
}




const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
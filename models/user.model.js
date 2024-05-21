const mongoose = require('mongoose');
const { isEmail } = require("validator");
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({

    googleId: {
        type: String,
        unique: true,
    },
    pseudo: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 55,
        trim: true,
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
        //required: function () { return !this.googleId; }, // Requis seulement si googleId n'est pas présent
        max: 1024,
        minlength: 8,
    },
    confirmPassword: {
        type: String,
        required: function () { return !this.googleId; }, // Requis seulement si googleId n'est pas présent
        max: 1024,
        minlength: 8,
    },
    phoneNumber: {
        type: String,
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
        type: [String],
    },
    following: {
        type: [String],
    },
    likes: {
        type: [String],
    },
    favoritePost: {
        type: [String],
    },
    savedPost: {
        type: [String],
    },
    birthDate: {
        type: String,
    },
    nationality: {
        type: String,
    },
    homeAddress: {
        streetNumber: String,
        streetName: String,
        city: String,
        state: String,
        department: String,
        region: String,
        postalCode: String,
        country: String,
    },
    avatar: {
        type: String,
        default: null,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    preferredLanguage: {
        type: String,
    },
    socialLinks: {
        twitter: String,
        linkedin: String,
        facebook: String,
        instagram: String,
        tiktok: String,
    },
    interests: {
        type: [String],
    },
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends_only']
        },
        postVisibility: {
            type: String,
            enum: ['public', 'private', 'friends_only']
        },
        messageNotifications: {
            type: String,
            enum: ['email', 'push', 'both', 'none']
        }
    },
    onlineStatus: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String, // Stocker le code de vérification à 6 chiffres
        default: null,
    },
    isVerified: {
        type: Boolean, // Indiquer si le compte de l'utilisateur est vérifié ou non
        default: false,
    },
    references: {
        referralCode: String,
        referredBy: String,
    },
    profession: {
        company: String,
        position: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},
    {
        timestamps: true,
    });


//play function before save into display 

/*userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = await bcrypt.hash(this.confirmPassword, salt);
    next();
});*/
//static method to login userxx
userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });

    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        console.log("Résultat de bcrypt.compare:", user.password);
        console.log("est ce que c'est vrai? ", password)
        const comparePasswords = async (password, hashedPassword) => {
            return await bcrypt.compare(password, hashedPassword);
        };

        // Utilisation de la fonction pour comparer le mot de passe fourni avec celui stocké dans la base de données
        const isPasswordCorrect = await comparePasswords(password, user.password);
        console.log("Viesn me voir", isPasswordCorrect)


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




userSchema.statics.setOnlineStatus = async function (userId, status) {
    try {
        const result = await this.updateOne({ _id: userId }, { $set: { onlineStatus: status } });
        console.log(`User ID: ${userId} - Status set to: ${status}`);
        console.log('Update result:', result);
    } catch (error) {
        console.error(`Error setting online status for user ID: ${userId}`, error);
    }
};




const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
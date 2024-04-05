const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
};

module.exports.signUp = async (req, res) => {
    const {
        pseudo,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phoneNumber,
        birthDate,
        nationality,
        homeAddress: {
            streetNumber,
            streetName,
            city,
            state,
            department,
            region,
            postalCode,
            country
        }
    } = req.body;

    try {
        const user = await UserModel.create({
            pseudo,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            phoneNumber,
            birthDate,
            nationality,
            homeAddress: {
                streetNumber,
                streetName,
                city,
                state,
                department,
                region,
                postalCode,
                country
            }
        });
        res.status(201).json({ user: user._id });
        console.log(JSON.stringify(user));
        console.log("user create ", user)
    }
    catch (err) {
        const errors = signUpErrors(err);
        res.status(400).json({ errors });
    }
}



module.exports.signIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        console.log(token);
        res.cookie('jwt', token, { httpOnly: true, maxAge });
        res.status(200).json({ user: user._id })
        console.log(user._id);
    } catch (err) {
        const errors = signInErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { expires: new Date(0), path: '/' });
    res.status(200).json({ message: "logout successful" });
    console.log("logout successful");
};


module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir de la demande

    try {
        const user = await UserModel.findById(userId); // Trouvez l'utilisateur dans la base de données
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.updatePassword(oldPassword, newPassword); // Mettez à jour le mot de passe de l'utilisateur
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
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
    const { pseudo, firstName, lastName, email, password, confirmPassword, phoneNumber } = req.body

    try {
        const user = await UserModel.create({ pseudo, firstName, lastName, email, password, confirmPassword, phoneNumber });
        res.status(201).json({ user: user._id });
        console.log(JSON.stringify(user));
    }
    catch (err) {
        const errors = signUpErrors(err);
        res.status(400).json({ errors }); // Utilisez un code d'erreur 400 pour indiquer une requête incorrecte
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
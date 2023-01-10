const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
}

//registers a new token

module.exports.signUp = async (req, res) => {
    console.log(req.body)
    const { pseudo, fisrtName, lastName, email, password, confirmPassword, phoneNumber } = req.body

    try {
        
        const user = await UserModel.create({ pseudo, fisrtName, lastName, email, password, confirmPassword, phoneNumber })
        res.status(201).json({ user: user_id });

    }

    catch (err) {
        res.status(200).send({ err })
    }
}

//logs in a user
module.exports.signIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await UserModel.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge })
        res.status(200).json({ user: user._id });
    }

    catch (err) {
        res.status(200).send({ err })
    }
}

//logs out a user
module.exports.logout = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
}
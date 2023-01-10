const UserModel = require("../models/user.model");


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

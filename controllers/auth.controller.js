const UserModel = require("../models/user.models");



module.exports.signUp = async (req, res) => {
    console.log("req.body")
    const { firstName, lastName, email, password, confirmPassword, phoneNumber } = req.body

    try {
        const user = await UserModel.create({ firstName, lastName, email, password, confirmPassword, phoneNumber });
        res.status(200).json({ user: user._id })
    }
    catch (err) {
        res.status(200).json({ err })
    }
}

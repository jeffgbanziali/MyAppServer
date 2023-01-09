const joi = require('joi');


function userValidation(body) {
    const userValidationSchema = joi.object({
        fisrtName: joi.string().min(2).max(30).trim().required(),
        lastName: joi.string().min(2).max(30).trim().required(),
        email: joi.string().email().trim().required(),
        password: joi.string().min(8).max(30).required(),
        confirmPassword: joi.string().min(8).max(30).required(),
        phoneNumber: joi.string().min(10).required(),

    })

    return userValidationSchema.validate(body)
}

module.exports = userValidation;
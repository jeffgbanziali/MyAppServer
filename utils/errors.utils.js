module.exports.signUpErrors = (err) => {
    let errors = { pseudo: '', email: '', password: '', confirmPassword: '', phoneNumber: '' }
    if (err.message.includes('pseudo'))
        errors.pseudo = 'Pseudo incorrect ou déjà pris';

    if (err.message.includes('password'))
        errors.password = 'Le mot de passe doit faire au moins 8 caractères minimum';

    if (err.message.includes('confirmPassword'))
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (err.message.includes('phoneNumber'))
        errors.phoneNumber = 'Numéro de téléphone incorrect';

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
        errors.pseudo = "Ce pseudo est déjà pris";

    if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
        errors.email = "Cet email est déjà enregistré";


    return errors;
};

module.exports.signInErrors = (err) => {
    let errors = { email: '', password: '' }

    if (err.message.includes("email"))
        errors.email = "Email inconnu";

    if (err.message.includes('password'))
        errors.password = "Le mot de passe ne correspond pas"

    return errors;
}

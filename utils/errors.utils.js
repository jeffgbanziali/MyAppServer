

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

//sign in error

module.exports.signInErrors = (err) => {
    let errors = { email: '', password: '' }

    if (err.message.includes("email"))
        errors.email = "Email inconnu";

    if (err.message.includes('password'))
        errors.password = "Le mot de passe ne correspond pas"

    return errors;
};

//update profile error
module.exports.uploadErrors = (err) => {
    let errors = { format: '', maxSize: ""};
  
    if (err.message.includes('invalid file'))
      errors.format = "Format incompatabile";
  
    if (err.message.includes('max size'))
      errors.maxSize = "Le fichier dépasse 500ko";
  
    return errors
  }

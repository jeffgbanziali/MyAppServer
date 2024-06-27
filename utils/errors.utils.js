module.exports.signUpErrors = (err) => {
    let errors = {
        pseudo: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        birthDate: "",
        gender: "",
        nationality: "",
        homeAddress: {
            streetNumber: "",
            streetName: "",
            city: "",
            state: "",
            department: "",
            region: "",
            postalCode: "",
            country: ""
        }
    };

    if (err.message.includes("pseudo"))
        errors.pseudo = "Pseudo incorrect ou déjà pris";

    if (err.message.includes("email"))
        errors.email = "Email incorrect";

    if (err.message.includes("password"))
        errors.password = "Le mot de passe doit faire 6 caractères minimum";

    if (err.message.includes("firstName"))
        errors.firstName = "Prénom incorrect";

    if (err.message.includes("lastName"))
        errors.lastName = "Nom incorrect";

    if (err.message.includes("phoneNumber"))
        errors.phoneNumber = "Numéro de téléphone incorrect";

    if (err.message.includes("birthDate"))
        errors.birthDate = "Date de naissance incorrecte";

    if (err.message.includes("gender"))
        errors.gender = "Genre incorrect";

    if (err.message.includes("nationality"))
        errors.nationality = "Nationalité incorrecte";

    if (err.message.includes("streetNumber"))
        errors.homeAddress.streetNumber = "Numéro de rue incorrect";

    if (err.message.includes("streetName"))
        errors.homeAddress.streetName = "Nom de rue incorrect";

    if (err.message.includes("city"))
        errors.homeAddress.city = "Ville incorrecte";

    if (err.message.includes("state"))
        errors.homeAddress.state = "État incorrect";

    if (err.message.includes("department"))
        errors.homeAddress.department = "Département incorrect";

    if (err.message.includes("region"))
        errors.homeAddress.region = "Région incorrecte";

    if (err.message.includes("postalCode"))
        errors.homeAddress.postalCode = "Code postal incorrect";

    if (err.message.includes("country"))
        errors.homeAddress.country = "Pays incorrect";

    if (err.code === 11000) {
        if (Object.keys(err.keyValue)[0].includes("pseudo"))
            errors.pseudo = "Ce pseudo est déjà pris";

        if (Object.keys(err.keyValue)[0].includes("email"))
            errors.email = "Cet email est déjà enregistré";
    }

    return errors;
};


module.exports.signInErrors = (err) => {
    let errors = { email: '', password: '' };

    if (err.message.includes('email') || err.message.includes('password')) {
        errors.email = "Identifiant ou mot de passe incorrect !!!";
    }

    return errors;
};



module.exports.uploadErrors = (err) => {
    let errors = { message: '' };

    if (err.message && err.message.includes('invalid file')) {
        errors.message = 'Invalid file type or size';
    } else {
        errors.message = 'An error occurred during file upload';
    }

    return errors;
};
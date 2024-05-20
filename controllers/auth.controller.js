const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');
const nodemailer = require('nodemailer');
const passport = require("passport")
const maxAge = 3 * 24 * 60 * 60; // 3 jours en secondes

const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    });
};
const generateVerificationCode = () => {
    const min = 100000; // Le plus petit nombre à 6 chiffres
    const max = 999999; // Le plus grand nombre à 6 chiffres
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
});

const verificationCode = generateVerificationCode();

const sendVerificationEmail = (user) => {

    const mailOptions = {
        from: {
            name: "Flajoo",
            addres: process.env.EMAIL_USER,
        },
        to: [user.email],
        subject: 'Email de vérification',
        html: `<!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation d'inscription - Flajoo</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="text-align: center;">
                    <img src="../uploads/email/2.png" alt="Logo Flajoo" style="max-width: 150px;">
                </div>
                <h2 style="text-align: center; color: #333;">Bienvenue, ${user.firstName} ${user.lastName} !</h2>
                <p style="text-align: justify;">Nous sommes ravis de vous accueillir sur Flajoo, la plateforme où les achats deviennent un plaisir.</p>
                <p style="text-align: justify;">Pour compléter votre inscription, veuillez saisir le code de vérification à 6 chiffres ci-dessous :</p>
                <div style="text-align: center;">
                    <h3 style="font-size: 24px; margin-bottom: 20px;">Code de vérification : <span style="color: #007bff;">${verificationCode}</span></h3>
                    <p style="font-size: 14px; color: #888;">Ce code de vérification expirera dans 10 minutes.</p>
                </div>
                <p style="text-align: justify;">Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.</p>
                <p style="text-align: left;font-size: 14px;">Cordialement,<br><br>L'équipe Flajoo</p>
                <p style="text-align: left;font-size: 12px;">30-32 Avenue de la République<br>Villejuif, Val-de-Marne<br>Île-de-France, France</p>
                <ul style="list-style-type: none;font-size: 12px; padding-left: 0;">
                    <li>Tel : + 33 6 05 57 28 02</li>
                    <li>Email : <a href="mailto:contact@flajoo.com" style="color: #007bff; text-decoration: none;">contact@flajoo.com</a></li>
                </ul>
                
            
            </div>
        
        </body>
        </html>
    `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Erreur lors de l\'envoi de l\'email : ', err);
        } else {
            console.log('Email envoyé : ' + info.response);
            console.log('voici le code géné : ' + verificationCode);
        }
    });
};


// Contrôleur pour vérifier le compte de l'utilisateur
exports.verifyAccount = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Recherchez l'utilisateur par son e-mail
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        // Vérifiez si le code de vérification soumis correspond au code envoyé par e-mail
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ success: false, message: 'Code de vérification incorrect' });
        }

        // Marquez l'utilisateur comme vérifié
        user.isVerified = true;
        // Réinitialisez le code de vérification (optionnel)
       // user.verificationCode = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Compte vérifié avec succès' });
    } catch (error) {
        console.error('Erreur lors de la vérification du compte :', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
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
        // Générer le code de vérification
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
            },
            verificationCode: verificationCode // Stocker le code de vérification dans le modèle utilisateur
        });

        // Envoyer l'email de vérification
        sendVerificationEmail(user);

        res.status(201).json({ user: user._id, userData: user });
        console.log("Utilisateur créé : ", user);
    } catch (err) {
        const errors = signUpErrors(err);
        res.status(400).json({ errors });
    }
};




module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        console.log(token);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
        console.log(user._id);
    } catch (err) {
        const errors = signInErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { expires: new Date(0), path: '/' });
    res.status(200).json({ message: "Déconnexion réussie" });
    console.log("Déconnexion réussie");
};

module.exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Obtenez l'ID de l'utilisateur à partir de la demande

    try {
        const user = await UserModel.findById(userId); // Trouvez l'utilisateur dans la base de données
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        await user.updatePassword(oldPassword, newPassword); // Mettez à jour le mot de passe de l'utilisateur
        res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du mot de passe :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};


module.exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Callback de connexion avec Google
module.exports.googleCallback = (req, res) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) {
            console.error('Erreur lors de la connexion avec Google :', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Authentification Google échouée' });
        }
        // Générer le jeton JWT
        const token = createToken(user._id);
        // Vous pouvez également rediriger ou effectuer d'autres actions nécessaires ici
        res.status(200).json({ token });
    })(req, res);
};
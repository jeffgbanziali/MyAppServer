const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { signUpErrors, signInErrors } = require('../utils/errors.utils');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');




const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
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


const sendVerificationEmail = (user, verificationCode) => {
    const mailOptions = {
        from: {
            name: "Flajoo",
            address: process.env.EMAIL_USER,
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
        <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; padding: 20px;">
                    <img src="cid:logo" alt="Logo Flajoo" style="max-width: 150px;">
                </div>
                <div style="padding: 20px;">
                    <h2 style="text-align: center; color: #333;">Bienvenue sur Flajoo, ${user.firstName} ${user.lastName} !</h2>
                    <p style="text-align: justify; color: #555;">Nous sommes ravis de vous compter parmi nous sur Flajoo, votre nouveau réseau social de confiance.</p>
                    <p style="text-align: justify; color: #555;">Pour finaliser votre inscription, veuillez entrer le code de vérification à 6 chiffres ci-dessous :</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <h3 style="font-size: 24px; color: #007bff; margin-bottom: 10px;">${verificationCode}</h3>
                        <p style="font-size: 14px; color: #888;">Ce code est valable pendant 10 minutes.</p>
                    </div>
                    <p style="text-align: justify; color: #555;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                    <p style="text-align: left; font-size: 14px; color: #555;">Cordialement,<br><br>L'équipe Flajoo</p>
                </div>
                <div style="padding: 20px; background-color: #f1f1f1; border-top: 1px solid #e0e0e0;">
                    <p style="text-align: left; font-size: 12px; color: #555;">30-32 Avenue de la République<br>Villejuif, Val-de-Marne<br>Île-de-France, France</p>
                    <ul style="list-style-type: none; padding-left: 0; font-size: 12px; color: #555;">
                        <li>Tel : + 33 6 05 57 28 02</li>
                        <li>Email : <a href="mailto:contact@flajoo.com" style="color: #007bff; text-decoration: none;">contact@flajoo.com</a></li>
                    </ul>
                </div>
            </div>
        
        </body>
        </html>`,
        attachments: [
            {
                filename: 'logo.png',
                path: '../uploads/email/2.png',
                cid: 'logo'
            }
        ]
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
module.exports.verifyAccount = async (req, res) => {
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
        console.log("mes data", { email, password })

        res.status(400).json({ errors });
    }
}

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



const client = new OAuth2Client({
    clientId: process.env.CLIENT_ID_GOOGLE_AUTH,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE_AUTH,
});

module.exports.googleSignIn = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        await getAccessToken(token); // Assurez-vous d'attendre la résolution de cette promesse

        res.status(200).send("OK");
    } catch (error) {
        console.error("Erreur lors de la connexion Google :", error);
        res.status(401).send("Unauthorized");
    }
}

const getAccessToken = async (code) => {
    try {
        const { tokens } = await client.getToken(code); // Utilisez l'instance client pour appeler getToken
        console.log("Tokens : ", tokens);
        saveCredentials(tokens);
    } catch (err) {
        console.log("Error :", err);
    }
}
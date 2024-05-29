const UserModel = require('../../models/user.model');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Configurer Nodemailer
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

// Générer un token pour la réinitialisation
const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// Demande de réinitialisation de mot de passe
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = generateToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

        await user.save();

        const resetUrl = `http://${req.headers.host}/resetPassword/${resetToken}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'An email has been sent to ' + user.email + ' with further instructions.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        console.log('Received reset request with token:', token);

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            console.log('Password reset token is invalid or has expired');
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        console.log('User found:', user);

        if (password !== confirmPassword) {
            console.log('Passwords do not match');
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        console.log('Passwords match. Proceeding with password reset.');


        await user.save();

        console.log('Password has been reset successfully for user:', user._id);
        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


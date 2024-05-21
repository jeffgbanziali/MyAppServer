const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID_GOOGLE_AUTH,
            clientSecret: process.env.CLIENT_SECRET_GOOGLE_AUTH,
            callbackURL: "http://localhost:4000/api/authentication/auth/google/callback",
            passReqToCallback: true
        },
        function (accessToken, refreshToken, profile, callback) {
            // Utiliser un modèle utilisateur pour vérifier et sauvegarder l'utilisateur
            // User.findOrCreate({ googleId: profile.id }, function (err, user) {
            //     return callback(err, user);
            // });
            return callback(null, profile); // Simplifié pour le test
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;

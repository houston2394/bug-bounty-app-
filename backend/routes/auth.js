const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const router = express.Router();

// Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      // In a real app, you would save the user to the database here
      // For now, we'll just allow any Google user to log in (or restrict to specific email)
      const user = {
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value
      };
      
      // OPTIONAL: Security check - restrict to your email only
      // if (user.email !== "your-email@gmail.com") {
      //   return done(null, false, { message: 'Unauthorized email' });
      // }
      
      return done(null, user);
    }
  ));
} else {
  console.warn("⚠️ Google Client ID/Secret not found. Auth will not work.");
}

// Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:8000/#/login?error=true' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:8000/#/dashboard');
  }
);

router.get('/current_user', (req, res) => {
  res.send(req.user || null);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('http://localhost:8000');
  });
});

module.exports = router;
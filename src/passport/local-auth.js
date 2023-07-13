const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (error) {
    done(error, null);
  }
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      return done(null, false, req.flash('signupMessage', 'The Email is already taken.'));
    } else {
      const newUser = new User();
      newUser.email = email;
      newUser.password = newUser.encryptPassword(password);
      await newUser.save();
      done(null, newUser);
    }
  } catch (error) {
    done(error, null);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false, req.flash('signinMessage', 'No User Found'));
    }
    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
    }
    return done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

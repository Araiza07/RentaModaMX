const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');


const app = express();
require('./database');
require('./passport/local-auth');

app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',engine);
app.set('view engine', 'ejs');
app.set('port',process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'myscretsession',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.signupMessage = req.flash('signupMessage');
    app.locals.signinMessage = req.flash('signinMessage');
    next();
});

app.use('/',require('./routes/index'))


app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));

});
import * as express from 'express';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

const Auth0Strategy = require('passport-auth0'),
    authOptions = {
        clientID: process.env.AUTH0_CLIENT_ID,
        domain: process.env.AUTH0_DOMAIN,
        redirectUri: process.env.AUTH0_CALLBACK_URL,
        audience: 'https://' + process.env.AUTH0_DOMAIN + '/userinfo',
        responseType: 'code',
        scope: 'openid profile create:barfs read:barfs'
    },
    strategy = new Auth0Strategy(
        {
            domain: process.env.AUTH0_DOMAIN,
            clientID: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            callbackURL: process.env.AUTH0_CALLBACK_URL
        },
        (accessToken, refreshToken, extraParams, profile, done) => {
            return done(null, profile);
        }
    );

function initRouter() {
    const router = express.Router();

    router.get(
        '/login',
        passport.authenticate('auth0', authOptions),
        function (req, res) {
            res.redirect('/');
        }
    );

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get(
        '/callback',
        passport.authenticate('auth0', {
            failureRedirect: '/'
        }),
        function (req, res) {
            res.redirect(req.session.returnTo || '/');
        }
    );

    router.get('/', function (req, res) {
        res.locals.area = 'home';
        res.render('areas/home');
    });

    return router;
}

export default function route(app: express.Application) {
    passport.use(strategy);

    // This can be used to keep a smaller payload
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        if (req.user) {
            res.locals.user = { id: req.user['_json'].sub, name: req.user.nickname, picture: req.user.picture };
        }

        next();
    });

    app.use("/", initRouter());
}
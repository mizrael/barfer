import * as express from 'express';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

const Auth0Strategy = require('passport-auth0'),
    env = {
        AUTH0_CLIENT_ID: 'J0rv26KV7CarQk2lf16UF6PMg8E6UczL',
        AUTH0_DOMAIN: 'mizrael.auth0.com',
        AUTH0_CALLBACK_URL: 'http://localhost:3100/callback'
    },
    authOptions = {
        clientID: env.AUTH0_CLIENT_ID,
        domain: env.AUTH0_DOMAIN,
        redirectUri: env.AUTH0_CALLBACK_URL,
        audience: 'https://' + env.AUTH0_DOMAIN + '/userinfo',
        responseType: 'code',
        scope: 'openid profile'
    },
    strategy = new Auth0Strategy(
        {
            domain: env.AUTH0_DOMAIN,
            clientID: env.AUTH0_CLIENT_ID,
            clientSecret: 'r7_0r9_Aktp9NWGpBh0LF3lDf8frCKIjeS3582QPZntng5yxxnVKQf3fgk-YjeyJ',
            callbackURL: env.AUTH0_CALLBACK_URL
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
            res.redirect('/user');
        }
    );

    router.get(
        '/callback',
        passport.authenticate('auth0', {
            failureRedirect: '/'
        }),
        function (req, res) {
            res.redirect('/user');
        }
    );

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

    app.use("/", initRouter());
}
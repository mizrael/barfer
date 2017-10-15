import * as express from 'express';
import * as request from 'request-promise';
import * as passport from 'passport';
import { IPublisher } from '../../common/services/publisher';
import { Message } from '../../common/services/message';

const Auth0Strategy = require('passport-auth0'),
    authOptions = {
        clientID: process.env.AUTH0_CLIENT_ID,
        domain: process.env.AUTH0_DOMAIN,
        redirectUri: process.env.AUTH0_CALLBACK_URL,
        failureRedirect: '/',
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

export interface IAuthService {
    init(app: express.Application);
    authenticate();
    requestAccessToken();
}

export class AuthService implements IAuthService {
    constructor(private readonly publisher: IPublisher) { }

    public init(app: express.Application) {
        passport.use(strategy);

        passport.serializeUser((user, done) => {
            let task = new Message("users", "user.logged", user['_json'].sub);
            this.publisher.publish(task);

            done(null, user);
        });

        passport.deserializeUser((user, done) => {
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
    }

    public authenticate() {
        return passport.authenticate('auth0', authOptions);
    }

    public requestAccessToken() {
        let headers = { 'content-type': 'application/json' },
            options = {
                url: 'https://' + process.env.AUTH0_DOMAIN + '/oauth/token',
                method: 'POST',
                headers: headers,
                json: true,
                body: {
                    audience: "barfer-api-gateway",
                    grant_type: 'client_credentials',
                    client_id: 'gLxvdWo4jDcgld7l1rocJmSlJu5lbglt',
                    client_secret: 'A8-KZ041ePuSakFODkUlNG7OOLjMFh-r0ZqIoIgF2VIr7eIuTG5bad00tkfcud0j'
                }
            };
        return request(options);
    };
}
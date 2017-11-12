import { ISubscriber, SubscriberOptions } from '../../common/services/subscriber';
import * as express from 'express';
import * as request from 'request-promise';
import * as passport from 'passport';
import { IPublisher } from '../../common/services/publisher';
import { Message } from '../../common/services/message';
import { Exchanges, Events } from '../../common/events';
import { RequestUtils } from '../../common/utils/requestUtils';
import { Queries } from '../../common/infrastructure/entities/queries';
import * as logger from '../../common/services/logger';

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
    constructor(private readonly publisher: IPublisher, private readonly subscriber: ISubscriber, private readonly socketServer: SocketIO.Server) { }

    public init(app: express.Application) {
        passport.use(strategy);

        passport.serializeUser((user, done) => {
            const userId = user['_json'].sub,
                msg = new Message(Exchanges.Users, Events.RequestUpdateUserData, userId);
            this.publisher.publish(msg);

            this.listenForBarfs(userId);

            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user);
        });

        app.use(passport.initialize());
        app.use(passport.session());

        app.use((req, res, next) => {
            if (req.user) {
                const loggedUserId = RequestUtils.getLoggedUserId(req);
                res.locals.user = { id: loggedUserId, name: req.user.nickname, picture: req.user.picture };
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

    private listenForBarfs(loggedUserId: string) {
        logger.info("listening for barfs for user " + loggedUserId);

        const key = Events.BarfFor + loggedUserId,
            options = new SubscriberOptions(Exchanges.Barfs, "barf-ready", key, task => {
                let barf = task.data as Queries.Barf;

                logger.info("received new barf: " + JSON.stringify(barf));

                this.socketServer.emit(key, barf);
                return Promise.resolve();
            });

        this.subscriber.register(options);
    }
}
import { ISubscriber, SubscriberOptions, ISubscriberFactory } from '../../common/services/subscriber';
import * as express from 'express';
import * as request from 'request-promise';
import * as passport from 'passport';
import { IPublisher } from '../../common/services/publisher';
import { Message } from '../../common/services/message';
import { Exchanges, Events } from '../../common/events';
import { RequestUtils } from '../../common/utils/requestUtils';
import { Entities } from '../../common/infrastructure/entities';
import * as logger from '../../common/services/logger';
import { config } from '../../common/config';

const Auth0Strategy = require('passport-auth0'),
    authOptions = {
        clientID: config.auth0.client_id,
        domain: config.auth0.domain,
        redirectUri: config.auth0.callback_url,
        failureRedirect: '/login',
        audience: 'https://' + config.auth0.domain + '/userinfo',
        responseType: 'code',
        scope: 'openid profile create:barfs read:barfs'
    },
    strategy = new Auth0Strategy(
        {
            domain: config.auth0.domain,
            clientID: config.auth0.client_id,
            clientSecret: config.auth0.client_secret,
            callbackURL: config.auth0.callback_url
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
    private subscribers: { [key: string]: ISubscriber };

    constructor(private readonly publisher: IPublisher,
        private readonly subscriberFactory: ISubscriberFactory,
        private readonly socketServer: SocketIO.Server) {
        this.subscribers = {};
    }

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
                this.listenForBarfs(loggedUserId);
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
                url: 'https://' + config.auth0.domain + '/oauth/token',
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
        const subscriber = this.subscribers[loggedUserId];
        if (subscriber) {
            return;
        }

        logger.info("listening for barfs for user " + loggedUserId);

        const key = Events.BarfFor + loggedUserId,
            options = new SubscriberOptions(Exchanges.Barfs, key, task => {
                const barf = task.data as Entities.Barf;

                logger.info("received new barf: " + JSON.stringify(barf));

                this.socketServer.emit(key, barf);
                return Promise.resolve();
            });
        this.subscribers[loggedUserId] = this.subscriberFactory.build(options);
    }
}
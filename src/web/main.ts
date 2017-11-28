import * as express from 'express';
import { Server } from 'http';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as path from 'path';
import * as amqplib from 'amqplib';
import * as io from 'socket.io';
import * as httpsRedirect from 'express-https-redirect';

import { HomeController } from './controllers/homeController';
import { AuthController } from './controllers/authController';
import { BarfsController } from './controllers/barfsController';

import { Subscriber, SubscriberOptions, SubscriberFactory } from '../common/services/subscriber';
import { Message } from '../common/services/message';
import { Publisher } from '../common/services/publisher';
import { AuthService } from './services/authService';
import { BarfService } from './services/barfService';
import { RestClient } from './utils/restClient';
import { UserService } from './services/userService';
import { UsersController } from './controllers/usersController';

import * as logger from '../common/services/logger';
import { ChannelProvider } from '../common/services/channelProvider';
import { viewUtils } from './middlewares/viewUtils';
import { config } from '../common/config';
import { WidgetsController } from './controllers/widgetsController';

function startSocket(server: Server): SocketIO.Server {
    const socketServer = io(server);
    return socketServer;
};

function initViewEngine(app: express.Application) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
};

function initMiddlewares(app: express.Application) {
    const staticFilesPath = path.join(__dirname, '/static');

    let MongoDBStore = require('connect-mongodb-session')(session),
        store = new MongoDBStore(
            {
                uri: config.connectionStrings.mongo,
                collection: 'sessions'
            });
    store.on('error', function (error) {
        logger.error("unable to store session data", error);
    });

    app.use('/', httpsRedirect())
        .use(cookieParser())
        .use(session({
            secret: config.session_secret || 'shhhhhhhhh',
            resave: true,
            store: store,
            saveUninitialized: true,
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: 3600000
            }
        }))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use('/static', express.static(staticFilesPath)).
        use(viewUtils());
};

function initControllers(app: express.Application, socketServer: SocketIO.Server) {
    const channelProvider = new ChannelProvider(config.connectionStrings.rabbit),
        publisher = new Publisher(channelProvider),
        subscriberFactory = new SubscriberFactory(channelProvider),
        authService = new AuthService(publisher, subscriberFactory, socketServer),
        restClient = new RestClient(authService),
        barfService = new BarfService(config.endpoints.barfs, restClient),
        userService = new UserService(config.endpoints.users, restClient);

    authService.init(app);

    new AuthController(app, authService);
    new BarfsController(app, barfService)
    new UsersController(app, userService, barfService);
    new HomeController(app);
    new WidgetsController(app, userService, barfService);
}

function startServer() {
    let app = express(),
        port = process.env.PORT || 3100;

    initMiddlewares(app);

    initViewEngine(app);

    const server = app.listen(port),
        socketServer = startSocket(server);

    initControllers(app, socketServer);

    logger.info('Web Client started on: ' + port);
};

startServer();
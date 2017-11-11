import * as express from 'express';
import { Server } from 'http';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as path from 'path';
import * as amqplib from 'amqplib';
import * as io from 'socket.io';

import { HomeController } from './controllers/homeController';
import { AuthController } from './controllers/authController';
import { BarfsController } from './controllers/barfsController';

import { Subscriber, SubscriberOptions } from '../common/services/subscriber';
import { Message } from '../common/services/message';
import { Queries } from '../common/infrastructure/entities/queries';
import { Publisher } from '../common/services/publisher';
import { AuthService } from './services/authService';
import { BarfService } from './services/barfService';
import { RestClient } from './utils/restClient';
import { UserService } from './services/userService';
import { UsersController } from './controllers/usersController';

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

    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cookieParser())
        .use(session({
            secret: process.env.SESSION_SECRET || 'shhhhhhhhh',
            resave: true,
            saveUninitialized: true
        }))
        .use('/static', express.static(staticFilesPath));
};

function initControllers(app: express.Application, socketServer: SocketIO.Server) {
    let publisher = new Publisher(process.env.RABBIT),
        subscriber = new Subscriber(process.env.RABBIT),
        authService = new AuthService(publisher, subscriber, socketServer),
        restClient = new RestClient(authService),
        barfService = new BarfService(process.env.BARFER_SERVICE_URL + "/barfs", restClient),
        userService = new UserService(process.env.USER_SERVICE_URL, restClient);
    authService.init(app);

    new HomeController(app);
    new AuthController(app, authService);
    new BarfsController(app, barfService)
    new UsersController(app, userService);
}

function startServer() {
    let app = express(),
        port = process.env.PORT || 3100;

    initMiddlewares(app);

    initViewEngine(app);

    const server = app.listen(port),
        socketServer = startSocket(server);

    initControllers(app, socketServer);

    console.log('Web Client started on: ' + port);
};

startServer();
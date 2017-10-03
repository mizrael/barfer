import * as express from 'express';
import { Server } from 'http';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import auth from './routes/auth';
import barfsApi from './routes/api/barfs';
import * as path from 'path';
import * as amqplib from 'amqplib';
import * as io from 'socket.io';
import { Task } from '../common/services/publisher';

function startSocket(server: Server): SocketIO.Server {
    let socket = io(server);

    socket.on('connection', (socket) => {
        // socket.emit('news', { hello: 'world' });
        // socket.on('my other event', function (data) {
        //     console.log(data);
        // });
    });

    return socket;
};

function initViewEngine(app: express.Application) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
};

function initMiddlewares(app: express.Application) {
    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cookieParser())
        .use(session({
            secret: process.env.SESSION_SECRET || 'shhhhhhhhh',
            resave: true,
            saveUninitialized: true
        }))
        .use('/static', express.static('./bin/web/static'));
};

function initMessageConsumers(socket: SocketIO.Server) {
    const connStr = process.env.RABBIT,
        exchangeName = "barfs",
        queueName = "barfs-ready",
        routingKey = "barf.ready";
    amqplib.connect(connStr).then(conn => {
        conn.createChannel().then(ch => {
            ch.assertExchange(exchangeName, 'direct', { durable: false });
            //ch.prefetch(1);
            ch.assertQueue(queueName, { exclusive: false }).then(q => {
                ch.bindQueue(q.queue, exchangeName, routingKey);
                ch.consume(q.queue, (msg: amqplib.Message) => {
                    let msgData = msg.content.toString(),
                        task = JSON.parse(msgData) as Task;
                    socket.emit(routingKey, task.data);

                    console.log("barf details ready: " + JSON.stringify(task.data));
                });
            });
        });
    });
}

function startServer() {
    let app = express(),
        port = process.env.PORT || 3100;

    initMiddlewares(app);

    initViewEngine(app);

    auth(app);
    barfsApi(app);

    let server = app.listen(port),
        socket = startSocket(server);

    initMessageConsumers(socket);

    console.log('Web Client started on: ' + port);
};

startServer();
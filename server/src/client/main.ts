import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import auth from './routes/auth';
import user from './routes/user';

function startServer() {
    let app = express(),
        port = process.env.PORT || 3100;

    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cookieParser())
        .use(session({
            secret: process.env.SESSION_SECRET || 'shhhhhhhhh',
            resave: true,
            saveUninitialized: true
        }));

    auth(app);
    user(app);

    app.listen(port);

    console.log('Web Client started on: ' + port);
};

startServer();
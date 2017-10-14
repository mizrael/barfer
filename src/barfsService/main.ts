import * as uuid from 'uuid';
import * as readline from 'readline';

import * as express from 'express';
import * as unless from 'express-unless';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import * as pathToRegexp from 'path-to-regexp';
import { Publisher } from '../common/services/publisher';
import { RepositoryFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';
import { BarfsController } from './controllers/barfsController';
import { CreateBarfCommandHandler } from './commands/createBarf';
import { BarfsArchiveQueryHandler } from './queries/barfsArchive';

function initRoutes(app: express.Application) {
    let publisher = new Publisher(process.env.RABBIT),
        repoFactory = new RepositoryFactory(),
        commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
        queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
        createBarfHandler = new CreateBarfCommandHandler(commandsDbContext, publisher),
        barfsArchiveHandler = new BarfsArchiveQueryHandler(queriesDbContext),
        barfsCtrl = new BarfsController(app, createBarfHandler, barfsArchiveHandler);
}

function startServer() {
    let app = express(),
        corsOptions = {
            origin: process.env.CORS_ORIGINS.split(',')
        },
        authCheck = jwt({
            // https://github.com/auth0/node-jwks-rsa/issues/15
            secret: (jwks as any).expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: process.env.JWKS_URI
            }),
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER,
            algorithms: ['RS256']
        }).unless({
            path: [
                { url: '/barfs', methods: ['GET'] }
            ]
        }),
        port = process.env.PORT || 3000;

    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cors(corsOptions))
        .use(authCheck);

    initRoutes(app);

    app.listen(port);

    console.log('Barfs Service started on: ' + port);
};

startServer();
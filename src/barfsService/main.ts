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
import { RepositoryFactory, DbFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';
import { BarfsController } from './controllers/barfsController';
import { CreateBarfCommandHandler } from './commands/createBarf';
import { BarfsArchiveQueryHandler } from './queries/barfsArchive';
import { UserBarfsQueryHandler } from './queries/userBarfs';
import { UsersController } from './controllers/usersController';
import * as logger from '../common/services/logger';

function initRoutes(app: express.Application) {
    let publisher = new Publisher(process.env.RABBIT),
        repoFactory = new RepositoryFactory(new DbFactory()),
        commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
        queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
        createBarfHandler = new CreateBarfCommandHandler(commandsDbContext, publisher),
        barfsArchiveHandler = new BarfsArchiveQueryHandler(queriesDbContext),
        userBarfsHandler = new UserBarfsQueryHandler(queriesDbContext),
        barfsCtrl = new BarfsController(app, createBarfHandler, barfsArchiveHandler),
        usersCtrl = new UsersController(app, userBarfsHandler);
}

function startServer() {
    let port = process.env.PORT || 3000,
        corsOrigins = process.env.CORS_ORIGINS || "",
        corsOptions = {
            origin: corsOrigins.split(',')
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
        }),
        app = express();

    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cors(corsOptions))
        .use(authCheck);

    initRoutes(app);

    app.listen(port);

    logger.info('Barfs Service started on: ' + port);
};

startServer();
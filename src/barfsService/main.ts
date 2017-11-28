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
import { QueriesDbContext } from '../common/infrastructure/dbContext';
import { BarfsController } from './controllers/barfsController';
import { CreateBarfCommandHandler } from './commands/createBarf';
import { BarfsArchiveQueryHandler } from './queries/barfsArchive';
import { UsersController } from './controllers/usersController';
import * as logger from '../common/services/logger';
import { GetBarfDetailsQueryHandler } from './queries/barfDetails';
import { BarfsByUserQueryHandler } from './queries/barfsByUser';
import { ChannelProvider } from '../common/services/channelProvider';
import { config } from '../common/config';
import { TagCloudQueryHandler } from './queries/tagCloud';
import { HashtagsController } from './controllers/hashtagsController';

function initRoutes(app: express.Application) {
    const channelProvider = new ChannelProvider(config.connectionStrings.rabbit),
        publisher = new Publisher(channelProvider),
        repoFactory = new RepositoryFactory(new DbFactory()),
        queriesDbContext = new QueriesDbContext(config.connectionStrings.mongo, repoFactory),
        createBarfHandler = new CreateBarfCommandHandler(publisher),
        barfsArchiveHandler = new BarfsArchiveQueryHandler(queriesDbContext),
        barfDetailsHandler = new GetBarfDetailsQueryHandler(queriesDbContext),
        userBarfsHandler = new BarfsByUserQueryHandler(queriesDbContext),
        barfsCtrl = new BarfsController(app, createBarfHandler, barfsArchiveHandler, barfDetailsHandler),
        usersCtrl = new UsersController(app, userBarfsHandler),
        hashTagsCtrl = new HashtagsController(app, new TagCloudQueryHandler(queriesDbContext));
}

function startServer() {
    let port = process.env.PORT || 3000,
        corsOrigins = config.cors_origins || "",
        corsOptions = {
            origin: corsOrigins.split(',')
        },
        authCheck = jwt({
            // https://github.com/auth0/node-jwks-rsa/issues/15
            secret: (jwks as any).expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: config.auth0.jwks_uri
            }),
            audience: config.auth0.jwt_audience,
            issuer: config.auth0.jwt_issuer,
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
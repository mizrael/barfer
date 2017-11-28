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
import { UsersController } from './controllers/usersController';
import { TopUsersQueryHandler } from './queries/topUsers';
import { FollowUserCommandHandler } from './commands/followUser';
import { IsUserFollowingQueryHandler } from './queries/isUserFollowing';
import * as logger from '../common/services/logger';
import { GetUserByIdQueryHandler } from './queries/userById';
import { ChannelProvider } from '../common/services/channelProvider';
import { config } from '../common/config';

function initRoutes(app: express.Application) {
    const channelProvider = new ChannelProvider(config.connectionStrings.rabbit),
        publisher = new Publisher(channelProvider),
        repoFactory = new RepositoryFactory(new DbFactory()),
        queriesDbContext = new QueriesDbContext(config.connectionStrings.mongo, repoFactory),
        topUsersHandler = new TopUsersQueryHandler(queriesDbContext),
        isUserFollowingHandler = new IsUserFollowingQueryHandler(queriesDbContext),
        followUserHandler = new FollowUserCommandHandler(queriesDbContext, publisher),
        userByIdHandler = new GetUserByIdQueryHandler(queriesDbContext, isUserFollowingHandler),
        usersController = new UsersController(app, topUsersHandler, followUserHandler, userByIdHandler);
}

function startServer() {
    const port = process.env.PORT || 3001,
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
        }).unless({
            path: [
                { url: pathToRegexp('/users'), methods: ['GET'] },
                { url: pathToRegexp('/users/:userId'), methods: ['GET'] },
                { url: pathToRegexp('/users/:userId/barfs'), methods: ['GET'] }
            ]
        }),
        app = express();

    app.use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cors(corsOptions))
        .use(authCheck);

    initRoutes(app);

    app.listen(port);

    logger.info('Users Service started on: ' + port);
};

startServer();
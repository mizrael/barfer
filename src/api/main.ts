import * as uuid from 'uuid';
import * as readline from 'readline';

import * as express from 'express';
import * as unless from 'express-unless';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as jwt from 'express-jwt';
import * as jwks from 'jwks-rsa';
import { IPublisher, Publisher } from '../common/services/publisher';
import { IRepository, RepositoryFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';
import { BarfsController } from './controllers/barfsController';

function initRoutes(app: express.Application) {
    let publisher = new Publisher(process.env.RABBIT),
        repoFactory = new RepositoryFactory(),
        commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
        queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
        barfsCtrl = new BarfsController(app, commandsDbContext, queriesDbContext, publisher);
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

    console.log('RESTful API server started on: ' + port);
};

startServer();


// function runClient() {
//     const
//         userId = uuid.v4(),
//         rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         }),
//         prefix = '>> ';

//     rl.on('line', function (line) {
//         if (line === "quit") {
//             rl.close();
//         } else {
//             let barf = new Barf(uuid.v4(), userId, line);
//             saveBarf(barf);

//             rl.setPrompt(prefix);
//             rl.prompt(true);
//         }
//     }).on('close', function () {
//         process.exit(0);
//     });

//     console.log("type 'quit' to exit");

//     rl.setPrompt(prefix);
//     rl.prompt(true);

// };

// runClient();
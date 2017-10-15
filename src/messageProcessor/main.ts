import { Subscriber, SubscriberOptions } from '../common/services/subscriber';

import { Publisher } from '../common/services/publisher';
import { RepositoryFactory, DbFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';

import { ICommand, ICommandHandler } from '../common/cqrs/command';
import { CreateBarfDetailsHandler, CreateBarfDetails } from './command/createBarfDetails'
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { Queries } from '../common/infrastructure/entities/queries';
import { RefreshUserDetails, RefreshUserDetailsCommandHandler } from './command/refreshUserDetails';

function commandHandlerFactory(commandName: string): ICommandHandler<ICommand> {
    const factories = {
        "create-barfs": function () {
            let publisher = new Publisher(process.env.RABBIT),
                repoFactory = new RepositoryFactory(new DbFactory()),
                commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                authService = new AuthService(),
                userService = new UserService(authService),
                handler = new CreateBarfDetailsHandler(userService, publisher, commandsDbContext, queriesDbContext);
            return handler;
        },
        "user-details": function () {
            let authService = new AuthService(),
                userService = new UserService(authService),
                repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new RefreshUserDetailsCommandHandler(userService, queriesDbContext);
            return handler;
        }
    };

    return factories[commandName]();
}

function listenToBarfs() {
    const subscriber = new Subscriber(process.env.RABBIT),
        createBarfOptions = new SubscriberOptions("barfs", "create-barfs", "create.barf", task => {
            let command = new CreateBarfDetails(task.data),
                handler = commandHandlerFactory("create-barfs");
            return handler.handle(command);
        }), updateUserOptions = new SubscriberOptions("users", "user-details", "user.logged", task => {
            let handler = commandHandlerFactory("user-details"),
                command = new RefreshUserDetails(task.data);
            return handler.handle(command);
        });
    subscriber.consume(createBarfOptions);
    subscriber.consume(updateUserOptions);

    console.log("Message Processor running...");
};

listenToBarfs();

// function initFakeData() {
//     var fs = require("fs"),
//         path = require("path");

//     var filename = path.join(__dirname, "/data/mockData.db"),
//         content = fs.readFileSync(filename),
//         users = JSON.parse(content);

//     let repoFactory = new RepositoryFactory(),
//         queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory);

//     console.log("creating " + users.length + " users...");
//     for (var i = 0; i != users.length; ++i) {

//         let user = users[i],
//             userDetails = new Queries.User();
//         userDetails.email = user.email;
//         userDetails.name = user.name;
//         userDetails.nickname = user.nickname;
//         userDetails.picture = user.picture;
//         userDetails.userId = user.userId;
//         userDetails.barfsCount = user.barfs.length;

//         queriesDbContext.Users.then(repo => repo.insert(userDetails)).then(() => {
//             console.log("created user: " + JSON.stringify(userDetails));

//             for (var b = 0; b != user.barfs.length; ++b) {

//                 let barf = user.barfs[b],
//                     barfDetails = new Queries.Barf();
//                 barfDetails.id = barf.id;
//                 barfDetails.userId = userDetails.userId;
//                 barfDetails.userName = userDetails.nickname;
//                 barfDetails.text = barf.text;
//                 barfDetails.creationDate = Date.now();

//                 queriesDbContext.Barfs.then(repo => {
//                     repo.insert(barfDetails).then(() => {
//                         console.log("barf created: " + JSON.stringify(barfDetails));
//                     });
//                 });
//             }
//         });
//     }
// };
// initFakeData();


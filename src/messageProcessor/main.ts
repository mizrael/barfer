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
import { Follow, FollowCommandHandler } from './command/follow';
import { Unfollow, UnfollowCommandHandler } from './command/unfollow';

function commandHandlerFactory(commandName: string): ICommandHandler<ICommand> {
    const factories = {
        "create-barfs": function () {
            let publisher = new Publisher(process.env.RABBIT),
                repoFactory = new RepositoryFactory(new DbFactory()),
                commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                handler = new CreateBarfDetailsHandler(userService, publisher, commandsDbContext, queriesDbContext);
            return handler;
        },
        "user-details": function () {
            let authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new RefreshUserDetailsCommandHandler(userService, queriesDbContext);
            return handler;
        },
        "follow": function () {
            let repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new FollowCommandHandler(queriesDbContext);
            return handler;
        },
        "unfollow": function () {
            let repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new UnfollowCommandHandler(queriesDbContext);
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
        }), followOptions = new SubscriberOptions("users", "user-follow", "user.follow", task => {
            let handler = commandHandlerFactory("follow"),
                command = new Follow(task.data.followerId, task.data.followedId);
            return handler.handle(command);
        }), unFollowOptions = new SubscriberOptions("users", "user-unfollow", "user.unfollow", task => {
            let handler = commandHandlerFactory("unfollow"),
                command = new Unfollow(task.data.followerId, task.data.followedId);
            return handler.handle(command);
        });
    subscriber.register(createBarfOptions);
    subscriber.register(updateUserOptions);
    subscriber.register(followOptions);
    subscriber.register(unFollowOptions);

    console.log("Message Processor running...");
};

listenToBarfs();
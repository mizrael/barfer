import { Subscriber, SubscriberOptions } from '../../../../../common/services/subscriber';

import { Publisher } from '../../../../../common/services/publisher';
import { RepositoryFactory, DbFactory } from '../../../../../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../../../../../common/infrastructure/dbContext';

import { ICommand, ICommandHandler } from '../../../../../common/cqrs/command';
import { CreateBarfDetailsHandler, CreateBarfDetails } from './command/createBarfDetails'
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { Queries } from '../../../../../common/infrastructure/entities/queries';
import { RefreshUserDetails, RefreshUserDetailsCommandHandler } from './command/refreshUserDetails';
import { Follow, FollowCommandHandler } from './command/follow';
import { Unfollow, UnfollowCommandHandler } from './command/unfollow';
import { Exchanges, Events } from '../../../../../common/events';
import { BroadcastBarfCommandHandler, BroadcastBarf } from './command/broadcastBarf';

import * as logger from '../../../../../common/services/logger';

function commandHandlerFactory<TC extends ICommand>(commandName: string): ICommandHandler<TC> {
    const factories = {
        "barf-create": function () {
            const publisher = new Publisher(process.env.RABBIT),
                repoFactory = new RepositoryFactory(new DbFactory()),
                commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                handler = new CreateBarfDetailsHandler(userService, publisher, commandsDbContext, queriesDbContext);
            return handler;
        },
        "broadcast-barf": function () {
            const publisher = new Publisher(process.env.RABBIT),
                repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new BroadcastBarfCommandHandler(publisher, queriesDbContext);
            return handler;
        },
        "user-details": function () {
            const authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new RefreshUserDetailsCommandHandler(userService, queriesDbContext);
            return handler;
        },
        "user-follow": function () {
            const repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new FollowCommandHandler(queriesDbContext);
            return handler;
        },
        "user-unfollow": function () {
            const repoFactory = new RepositoryFactory(new DbFactory()),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                handler = new UnfollowCommandHandler(queriesDbContext);
            return handler;
        }
    };

    return factories[commandName]();
}

function listenToBarfs() {
    const subscriber = new Subscriber(process.env.RABBIT),
        createBarfOptions = new SubscriberOptions(Exchanges.Barfs, "barf-create", Events.BarfCreated, task => {
            const command = new CreateBarfDetails(task.data),
                handler = commandHandlerFactory<CreateBarfDetails>("barf-create");
            return handler.handle(command);
        }),
        broadcastBarfOptions = new SubscriberOptions(Exchanges.Barfs, "broadcast-barf", Events.BarfReady, task => {
            const command = new BroadcastBarf(task.data),
                handler = commandHandlerFactory<BroadcastBarf>("broadcast-barf");
            return handler.handle(command);
        }), updateUserOptions = new SubscriberOptions(Exchanges.Users, "user-details", Events.RequestUpdateUserData, task => {
            const handler = commandHandlerFactory<RefreshUserDetails>("user-details"),
                command = new RefreshUserDetails(task.data);
            return handler.handle(command);
        }), followOptions = new SubscriberOptions(Exchanges.Users, "user-follow", Events.UserFollowed, task => {
            const handler = commandHandlerFactory<Follow>("user-follow"),
                command = new Follow(task.data.followerId, task.data.followedId);
            return handler.handle(command);
        }), unFollowOptions = new SubscriberOptions(Exchanges.Users, "user-unfollow", Events.UserUnfollowed, task => {
            const handler = commandHandlerFactory<Unfollow>("user-unfollow"),
                command = new Unfollow(task.data.followerId, task.data.followedId);
            return handler.handle(command);
        });
    subscriber.register(createBarfOptions);
    subscriber.register(broadcastBarfOptions);
    subscriber.register(updateUserOptions);
    subscriber.register(followOptions);
    subscriber.register(unFollowOptions);

    logger.info("Message Processor running...");
};

listenToBarfs();
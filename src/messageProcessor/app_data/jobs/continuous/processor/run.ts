import { Subscriber, SubscriberOptions, SubscriberFactory } from '../../../../../common/services/subscriber';

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
import { ChannelProvider } from '../../../../../common/services/channelProvider';

const dbFactory = new DbFactory(),
    repoFactory = new RepositoryFactory(dbFactory),
    queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
    channelProvider = new ChannelProvider(process.env.RABBIT),
    subscriberFactory = new SubscriberFactory(channelProvider);

function commandHandlerFactory<TC extends ICommand>(commandName: string): ICommandHandler<TC> {
    const factories = {
        "barf-create": function () {
            const publisher = new Publisher(channelProvider),
                authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                handler = new CreateBarfDetailsHandler(userService, publisher, queriesDbContext);
            return handler;
        },
        "broadcast-barf": function () {
            const publisher = new Publisher(channelProvider),
                handler = new BroadcastBarfCommandHandler(publisher, queriesDbContext);
            return handler;
        },
        "user-details": function () {
            const authService = new AuthService(process.env.AUTH0_DOMAIN),
                userService = new UserService(authService, process.env.AUTH0_DOMAIN),
                handler = new RefreshUserDetailsCommandHandler(userService, queriesDbContext);
            return handler;
        },
        "user-follow": function () {
            const handler = new FollowCommandHandler(queriesDbContext);
            return handler;
        },
        "user-unfollow": function () {
            const handler = new UnfollowCommandHandler(queriesDbContext);
            return handler;
        }
    };

    return factories[commandName]();
}

function listenToBarfs() {
    const createBarfOptions = new SubscriberOptions(Exchanges.Barfs, "barf-create", Events.BarfCreated, task => {
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

    subscriberFactory.build(createBarfOptions);
    subscriberFactory.build(broadcastBarfOptions);
    subscriberFactory.build(updateUserOptions);
    subscriberFactory.build(followOptions);
    subscriberFactory.build(unFollowOptions);

    logger.info("Message Processor running...");
};

listenToBarfs();

process.on('SIGINT', function () {
    dbFactory.close(process.env.MONGO).then(() => {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});
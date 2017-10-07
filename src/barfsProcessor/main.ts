import { Subscriber, SubscriberOptions } from '../common/services/subscriber';

import { Publisher } from '../common/services/publisher';
import { RepositoryFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';

import { ICommand, ICommandHandler } from '../common/cqrs/command';
import { CreateBarfDetailsHandler, CreateBarfDetails } from './commandHandlers/createBarfDetails'
import { AuthService } from './services/authService';
import { UserService } from './services/userService';

const subscriber = new Subscriber(process.env.RABBIT);

function commandHandlerFactory(commandName: string): ICommandHandler<ICommand> {
    const factories = {
        "create-barfs": function () {
            let publisher = new Publisher(process.env.RABBIT),
                connStr = process.env.MONGO,
                repoFactory = new RepositoryFactory(),
                commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
                queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
                authService = new AuthService(),
                userService = new UserService(authService),
                handler = new CreateBarfDetailsHandler(userService, publisher, commandsDbContext, queriesDbContext);
            return handler;
        }
    };

    return factories[commandName]();
}

function listenToBarfs() {
    const options = new SubscriberOptions("barfs", "create-barfs", "create.barf", task => {
        let handler = commandHandlerFactory("create-barfs"),
            command = new CreateBarfDetails(task.data);
        return (handler) ? handler.handle(command) : Promise.resolve();
    });
    subscriber.consume(options);
};

listenToBarfs();

console.log("Barfs Processor running...");


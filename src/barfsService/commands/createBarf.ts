import { ICommandHandler, ICommand } from "../../common/cqrs/command";
import { ICommandsDbContext } from "../../common/infrastructure/dbContext";
import { IPublisher } from "../../common/services/publisher";
import { Commands } from "../../common/infrastructure/entities/commands";
import { Message } from "../../common/services/message";
import { Events, Exchanges } from "../../common/events";
import * as logger from '../../common/services/logger';

export class CreateBarf implements ICommand {
    constructor(public readonly id: string,
        public readonly text: string,
        public authorId: string) { }
}

export class CreateBarfCommandHandler implements ICommandHandler<CreateBarf>{
    constructor(private readonly commandsDbCtx: ICommandsDbContext,
        private readonly publisher: IPublisher) { }

    handle(command: CreateBarf): Promise<void> {
        const task = new Message(Exchanges.Barfs, Events.BarfCreated, command);
        this.publisher.publish(task);
        logger.info("published barf create command: " + JSON.stringify(command));
        return Promise.resolve();
    }

}
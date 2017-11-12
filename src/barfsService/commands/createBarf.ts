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
        return this.commandsDbCtx.Barfs.then(repo => {
            let me = this,
                barf: Commands.Barf = {
                    id: command.id,
                    userId: command.authorId,
                    text: command.text,
                    creationDate: Date.now()
                };

            return repo.insert(barf)
                .then(() => {
                    logger.info("new barf created: '" + barf.id + "', publishing event...");

                    let task = new Message(Exchanges.Barfs, Events.BarfCreated, barf.id);
                    me.publisher.publish(task);
                });
        });
    }

}
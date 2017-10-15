import { ICommandHandler, ICommand } from "../../common/cqrs/command";
import { ICommandsDbContext } from "../../common/infrastructure/dbContext";
import { IPublisher } from "../../common/services/publisher";
import { Commands } from "../../common/infrastructure/entities/commands";
import { Message } from "../../common/services/message";

export class CreateBarf implements ICommand {
    constructor(public readonly text: string,
        public authorId: string) { }
}

export class CreateBarfCommandHandler implements ICommandHandler<CreateBarf>{
    constructor(private readonly commandsDbCtx: ICommandsDbContext,
        private readonly publisher: IPublisher) { }

    handle(command: CreateBarf): Promise<void> {
        return this.commandsDbCtx.Barfs.then(repo => {
            let me = this,
                barf: Commands.Barf = {
                    id: null,
                    userId: command.authorId,
                    text: command.text,
                    creationDate: Date.now()
                };

            repo.insert(barf)
                .then((result) => {
                    let task = new Message("barfs", "create.barf", barf.id.toHexString());
                    me.publisher.publish(task);
                });
        });
    }

}
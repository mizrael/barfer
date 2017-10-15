import { ICommand, ICommandHandler } from "../../common/cqrs/command";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";
import { IPublisher } from "../../common/services/publisher";

export class FollowUser implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string) { }
}

export class FollowUserCommandHandler implements ICommandHandler<FollowUser>{
    constructor(private readonly _queriesDbContext: IQueriesDbContext,
        private readonly publisher: IPublisher) { }

    handle(command: FollowUser): Promise<void> {
        return null;
        // return this.commandsDbCtx.Barfs.then(repo => {
        //     let me = this,
        //         barf = new Commands.Barf(command.authorId, command.text);

        //     repo.insert(barf)
        //         .then((result) => {
        //             let task = new Message("barfs", "create.barf", barf.id.toHexString());
        //             me.publisher.publish(task);
        //         });
        // });
    }

}
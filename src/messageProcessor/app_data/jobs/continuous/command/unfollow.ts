import { IQueriesDbContext } from '../../../../../common/infrastructure/dbContext';
import { ICommandHandler, ICommand } from '../../../../../common/cqrs/command';
import { Queries } from '../../../../../common/infrastructure/entities/queries';
import * as logger from '../../../../../common/services/logger';
export class Unfollow implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string) { }
}

export class UnfollowCommandHandler implements ICommandHandler<Unfollow>{
    public constructor(private readonly _queriesDbContext: IQueriesDbContext) { }

    async handle(command: Unfollow): Promise<void> {
        logger.info("unfollowing: " + JSON.stringify(command));
        let repo = await this._queriesDbContext.Relationships,
            filter: Queries.Relationship = {
                fromId: command.followerId,
                toId: command.followedId
            };
        await repo.deleteMany(filter);
    }

}
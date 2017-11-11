import { IQueriesDbContext } from '../../../../../common/infrastructure/dbContext';
import { ICommandHandler, ICommand } from '../../../../../common/cqrs/command';
import { Queries } from '../../../../../common/infrastructure/entities/queries';
import * as logger from '../../../../../common/services/logger';

export class Follow implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string) { }
}

export class FollowCommandHandler implements ICommandHandler<Follow>{
    public constructor(private readonly _queriesDbContext: IQueriesDbContext) { }

    async handle(command: Follow): Promise<void> {
        logger.info("following: " + JSON.stringify(command));

        let repo = await this._queriesDbContext.Relationships,
            entity: Queries.Relationship = {
                fromId: command.followerId,
                toId: command.followedId
            };
        await repo.upsertOne(entity, entity);
    }

}
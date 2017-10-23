import { ICommand, ICommandHandler } from "../../common/cqrs/command";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";
import { IPublisher } from "../../common/services/publisher";
import { IsUserFollowing } from "../queries/isUserFollowing";
import { IQueryHandler } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";

export class FollowUser implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string) { }
}

export class FollowUserCommandHandler implements ICommandHandler<FollowUser>{
    constructor(private readonly _queriesDbContext: IQueriesDbContext,
        private readonly _isUserFollowingHandler: IQueryHandler<IsUserFollowing, boolean>) { }

    public async handle(command: FollowUser): Promise<void> {
        let isFollowing = await this._isUserFollowingHandler.handle({ followerId: command.followerId, followedId: command.followedId });
        if (isFollowing) return;

        let filter = { from: command.followerId },
            repo = await this._queriesDbContext.Relationships,
            entity = await repo.findOne(filter);
        if (!entity) {
            await repo.insert({ fromId: command.followerId, toId: command.followedId });
        }
    }

}
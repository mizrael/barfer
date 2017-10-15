import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";

export class IsUserFollowing implements IQuery {
    constructor(public readonly followerId: string, public readonly followedId: string) { }
}

export class IsUserFollowingQueryHandler implements IQueryHandler<IsUserFollowing, boolean>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    public async handle(query: IsUserFollowing): Promise<boolean> {
        let repo = await this.queriesDbCtx.Following,
            filter = {
                userId: query.followerId,
                "following.entityId": query.followedId
            },
            result = await repo.findOne(filter);

        return (null !== result);
    }

}
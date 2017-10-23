import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";

export class IsUserFollowingMultiple implements IQuery {
    constructor(public readonly followerId: string, public readonly followedIds: string[]) { }
}

export class IsUserFollowingMultipleQueryHandler implements IQueryHandler<IsUserFollowingMultiple, string[]>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    public async handle(query: IsUserFollowingMultiple): Promise<string[]> {
        let filter = new Query({
            fromId: query.followerId,
            toId: { $in: query.followedIds }
        }, null, 0, 0),
            repo = await this.queriesDbCtx.Relationships,
            result = await repo.find(filter);

        if (!result || 0 === result.totalCount) return [];

        return result.items.map(e => e.toId);
    }
}
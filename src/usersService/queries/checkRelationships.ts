import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Entities } from "../../common/infrastructure/entities";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";

export class CheckRelationships implements IQuery {
    constructor(public readonly followerId: string, public readonly followedIds: string[]) { }
}

export class CheckRelationshipsQueryHandler implements IQueryHandler<CheckRelationships, string[]>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    public async handle(query: CheckRelationships): Promise<string[]> {
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
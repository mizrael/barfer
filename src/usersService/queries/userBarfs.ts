import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";
import { PagedCollection } from "../../common/dto/pagedCollection";

export class UserBarfs implements IQuery {
    constructor(public readonly userId: string, public readonly page: number, public readonly pageSize: number) { }
}

export class UserBarfsQueryHandler implements IQueryHandler<UserBarfs, PagedCollection<Queries.Barf>>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    handle(query: UserBarfs): Promise<PagedCollection<Queries.Barf>> {
        let pageSize = Math.min(100, query.pageSize);
        return this.queriesDbCtx.Barfs.then(repo => {
            let mongoQuery = new Query({ userId: query.userId }, { _id: -1 }, pageSize, query.page);

            return repo.find(mongoQuery);
        });
    }

}
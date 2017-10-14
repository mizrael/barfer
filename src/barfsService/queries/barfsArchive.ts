import { IQuery, IQueryHandler } from "../../common/cqrs/query";
import { PagedCollection } from "../../common/dto/pagedCollection";
import { Queries } from "../../common/infrastructure/entities/queries";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";
import { Query } from "../../common/infrastructure/db";

export class BarfsArchive implements IQuery {
    constructor(public readonly page: number, public readonly pageSize: number) { }
}

export class BarfsArchiveQueryHandler implements IQueryHandler<BarfsArchive, PagedCollection<Queries.Barf>>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    handle(query: BarfsArchive): Promise<PagedCollection<Queries.Barf>> {
        return this.queriesDbCtx.Barfs.then(repo => {
            let mongoQuery = new Query({}, { _id: -1 }, !query.pageSize ? 10 : query.pageSize, query.page);
            return repo.find(mongoQuery);
        });
    }
}
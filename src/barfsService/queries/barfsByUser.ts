import { IQuery, IQueryHandler } from "../../common/cqrs/query";
import { PagedCollection } from "../../common/dto/pagedCollection";
import { Queries } from "../../common/infrastructure/entities/queries";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";
import { Query } from "../../common/infrastructure/db";

export class BarfsByUser implements IQuery {
    constructor(public readonly userId: string, public readonly page: number, public readonly pageSize: number) { }
}

export class BarfsByUserQueryHandler implements IQueryHandler<BarfsByUser, PagedCollection<Queries.Barf>>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    async handle(query: BarfsByUser): Promise<PagedCollection<Queries.Barf>> {
        const barfsRepo = await this.queriesDbCtx.Barfs,
            barfsQuery = new Query({ userId: query.userId }, { _id: -1 }, !query.pageSize ? 10 : query.pageSize, query.page),
            barfs = await barfsRepo.find(barfsQuery);

        return barfs;
    }
}
import { IQuery, IQueryHandler } from "../../common/cqrs/query";
import { PagedCollection } from "../../common/dto/pagedCollection";
import { Queries } from "../../common/infrastructure/entities/queries";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";
import { Query } from "../../common/infrastructure/db";

export class BarfsArchive implements IQuery {
    constructor(public readonly forUser: string, public readonly author: string, public readonly page: number, public readonly pageSize: number) { }
}

export class BarfsArchiveQueryHandler implements IQueryHandler<BarfsArchive, PagedCollection<Queries.Barf>>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    async handle(query: BarfsArchive): Promise<PagedCollection<Queries.Barf>> {
        let filter = {};

        if (query.forUser && '' != query.forUser) {
            const relsRepo = await this.queriesDbCtx.Relationships,
                relsQuery = new Query({ fromId: query.forUser }, null, 0, 0),
                rels = await relsRepo.find(relsQuery),
                followed = rels.items.map((v, i) => {
                    return v.toId;
                });
            followed.push(query.forUser);

            filter['userId'] = { $in: followed };
        }

        if (query.author && '' != query.author) {
            filter['userName'] = query.author;
        }

        const barfsRepo = await this.queriesDbCtx.Barfs,
            barfsQuery = new Query(filter, { _id: -1 }, !query.pageSize ? 10 : query.pageSize, query.page),
            barfs = await barfsRepo.find(barfsQuery);

        return barfs;
    }
}
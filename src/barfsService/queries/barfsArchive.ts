import { IQuery, IQueryHandler } from "../../common/cqrs/query";
import { PagedCollection } from "../../common/dto/pagedCollection";
import { Queries } from "../../common/infrastructure/entities/queries";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";
import { Query } from "../../common/infrastructure/db";

export class BarfsArchive implements IQuery {
    constructor(public readonly forUser: string, public readonly page: number, public readonly pageSize: number) { }
}

export class BarfsArchiveQueryHandler implements IQueryHandler<BarfsArchive, PagedCollection<Queries.Barf>>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    async handle(query: BarfsArchive): Promise<PagedCollection<Queries.Barf>> {
        let followingRepo = await this.queriesDbCtx.Following,
            following = await followingRepo.findOne({ userId: query.forUser });
        if (!following || !following.following || 0 === following.following.length)
            return PagedCollection.empty<Queries.Barf>();

        let followed = following.following.map((v, i) => {
            return v.entityId;
        }), barfsRepo = await this.queriesDbCtx.Barfs,
            mongoQuery = new Query({ userId: { $in: followed } }, { _id: -1 }, !query.pageSize ? 10 : query.pageSize, query.page),
            barfs = await barfsRepo.find(mongoQuery);

        return barfs;
    }
}
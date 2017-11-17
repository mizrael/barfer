import { IQuery, IQueryHandler } from "../../common/cqrs/query";
import { PagedCollection } from "../../common/dto/pagedCollection";
import { Entities } from "../../common/infrastructure/entities";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";
import { Query } from "../../common/infrastructure/db";
import { BarfDetails } from "../controllers/dto";

export class GetBarfDetails implements IQuery {
    constructor(public readonly barfId: string) { }
}

export class GetBarfDetailsQueryHandler implements IQueryHandler<GetBarfDetails, BarfDetails>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    async handle(query: GetBarfDetails): Promise<BarfDetails> {
        const barfsRepo = await this.queriesDbCtx.Barfs,
            barf = await barfsRepo.findOne({ id: query.barfId }) as BarfDetails;

        return barf;
    }
}
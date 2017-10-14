import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";
import { Query } from "../../common/infrastructure/db";
import { QueriesDbContext } from "../../common/infrastructure/dbContext";

export class TopUsers implements IQuery { }

export class TopUsersQueryHandler implements IQueryHandler<TopUsers, Queries.User[]>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    handle(query: TopUsers): Promise<Queries.User[]> {
        return this.queriesDbCtx.Users.then(repo => {
            let mongoQuery = new Query({}, { barfsCount: -1 }, 10);

            return repo.find(mongoQuery).then(items => {
                return items.items;
            });
        });
    }

}
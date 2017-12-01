import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Entities } from "../../common/infrastructure/entities";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";
import { CheckRelationships, CheckRelationshipsQueryHandler } from "./checkRelationships";
import { User } from "./dto";

export class TopUsers implements IQuery {
    constructor(public readonly forUser: string, public readonly orderBy: string, public readonly pageSize: number) { }
}

export class TopUsersQueryHandler implements IQueryHandler<TopUsers, User[]>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    private mapEntity(e: Entities.User): User {
        return {
            userId: e.userId,
            nickname: e.nickname,
            email: e.email,
            name: e.name,
            picture: e.picture,
            barfsCount: e.barfsCount,
            followersCount: e.followersCount,
            followsCount: e.followsCount,
            followed: false
        };
    }

    private mapFollowedEntity(e: Entities.User, followedUserIdsDict: {}): User {
        let u = this.mapEntity(e);
        u.followed = followedUserIdsDict[e.userId];

        return u;
    }

    async handle(query: TopUsers): Promise<User[]> {
        const sortBy = {}; // { barfsCount: -1 }

        if (query.orderBy) {
            sortBy[query.orderBy] = -1;
        }

        const mongoQuery = new Query({}, sortBy, query.pageSize),
            repo = await this.queriesDbCtx.Users,
            entities = await repo.find(mongoQuery);

        if (!entities || 0 === entities.totalCount)
            return [];

        if (!query.forUser || '' == query.forUser)
            return entities.items.map(this.mapEntity);

        const userIds = entities.items.map(e => e.userId),
            followedQuery = new CheckRelationships(query.forUser, userIds),
            followedQueryHandler = new CheckRelationshipsQueryHandler(this.queriesDbCtx),
            followedUserIds = await followedQueryHandler.handle(followedQuery);

        if (!followedUserIds || 0 === followedUserIds.length)
            return entities.items.map(this.mapEntity);

        let followedUserIdsDict = {};
        followedUserIds.forEach(e => followedUserIdsDict[e] = true);

        return entities.items.filter(e => e.userId !== query.forUser)
            .map(e => this.mapFollowedEntity(e, followedUserIdsDict));
    }

}
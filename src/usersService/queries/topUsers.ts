import { IQueryHandler, IQuery } from "../../common/cqrs/query";
import { Queries } from "../../common/infrastructure/entities/queries";
import { Query } from "../../common/infrastructure/db";
import { IQueriesDbContext } from "../../common/infrastructure/dbContext";
import { IsUserFollowingMultiple, IsUserFollowingMultipleQueryHandler } from "./isUserFollowingMultiple";

export interface User {
    userId: string;
    nickname: string;
    email: string;
    name: string;
    picture: string;
    barfsCount: Number;
    followed: boolean;
}

export class TopUsers implements IQuery {
    constructor(public readonly forUser: string) { }
}

export class TopUsersQueryHandler implements IQueryHandler<TopUsers, User[]>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext) { }

    private mapEntity(e: Queries.User): User {
        return {
            userId: e.userId,
            nickname: e.nickname,
            email: e.email,
            name: e.name,
            picture: e.picture,
            barfsCount: e.barfsCount,
            followed: false
        };
    }

    private mapFollowedEntity(e: Queries.User, followedUserIdsDict: {}): User {
        let u = this.mapEntity(e);
        u.followed = followedUserIdsDict[e.userId];

        return u;
    }

    async handle(query: TopUsers): Promise<User[]> {
        let mongoQuery = new Query({}, { barfsCount: -1 }, 10),
            repo = await this.queriesDbCtx.Users,
            entities = await repo.find(mongoQuery);

        if (!entities || 0 === entities.totalCount)
            return [];

        if (!query.forUser || '' == query.forUser)
            return entities.items.map(this.mapEntity);

        const userIds = entities.items.map(e => e.userId),
            followedQuery = new IsUserFollowingMultiple(query.forUser, userIds),
            followedQueryHandler = new IsUserFollowingMultipleQueryHandler(this.queriesDbCtx),
            followedUserIds = await followedQueryHandler.handle(followedQuery);

        if (!followedUserIds || 0 === followedUserIds.length)
            return entities.items.map(this.mapEntity);

        let followedUserIdsDict = {};
        followedUserIds.forEach(e => followedUserIdsDict[e] = true);

        return entities.items.map(e => this.mapFollowedEntity(e, followedUserIdsDict));
    }

}
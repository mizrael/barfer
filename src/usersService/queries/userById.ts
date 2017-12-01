import { IsUserFollowing } from './isUserFollowing';
import { IQueriesDbContext } from '../../common/infrastructure/dbContext';
import { IQueryHandler, IQuery } from '../../common/cqrs/query';
import { User, NullUser } from './dto';

export class GetUserById implements IQuery {
    constructor(public readonly nickname: string, public readonly forUser?: string) { }
}

export class GetUserByIdQueryHandler implements IQueryHandler<GetUserById, User>{
    constructor(private readonly queriesDbCtx: IQueriesDbContext,
        private readonly isFollowingHandler: IQueryHandler<IsUserFollowing, boolean>) { }

    public async handle(query: GetUserById): Promise<User> {
        const repo = await this.queriesDbCtx.Users,
            user = await repo.findOne({ nickname: query.nickname });
        if (!user)
            return NullUser;

        const isFollowing = (query.forUser && '' !== query.forUser && await this.isFollowingHandler.handle({ followerId: query.forUser, followedId: user.userId }));
        const relsRepo = await this.queriesDbCtx.Relationships,
            followersCount = await relsRepo.count({toId: user.userId}),
            followsCount = await relsRepo.count({fromId: user.userId});

        return {
            email: user.email,
            barfsCount: user.barfsCount,
            followersCount: user.followersCount,
            followsCount: user.followsCount,
            name: user.name,
            nickname: user.nickname,
            picture: user.picture,
            userId: user.userId,
            followed: isFollowing
        };
    }

}
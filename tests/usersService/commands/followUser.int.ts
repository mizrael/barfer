import * as uuid from 'uuid';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';
import { IQueriesDbContext, QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { IRepository, DbFactory, RepositoryFactory } from '../../../src/common/infrastructure/db';
import { FollowUserCommandHandler, FollowUser } from '../../../src/usersService/commands/followUser';
import { IntegrationTestsConfig } from '../../config';
import { IsUserFollowingQueryHandler } from '../../../src/usersService/queries/isUserFollowing';

describe('FollowUserCommandHandler', () => {
    const expect = chai.expect;
    chai.use(spies);

    const userId = uuid.v4(),
        notFollowingUser = uuid.v4(),
        followedUserId = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        isUserFollowingHandler = new IsUserFollowingQueryHandler(queriesDbContext),
        sut = new FollowUserCommandHandler(queriesDbContext, isUserFollowingHandler);

    before(async () => {
        let repo = await queriesDbContext.Following,
            entity: Queries.Follow = {
                userId: userId,
                following: [{
                    entityId: followedUserId
                }]
            };
        await repo.insert(entity);
    });

    it('should do nothing when user is already following', async () => {
        let command = new FollowUser(userId, followedUserId),
            followingRepo = await queriesDbContext.Following,
            followingRepoSpy = chai.spy.on(followingRepo, "findOne");

        await sut.handle(command);

        expect(followingRepoSpy).to.not.have.been.called;
    });

    it('should append new followed user when not following', async () => {
        let command = new FollowUser(userId, uuid.v4()),
            followingRepo = await queriesDbContext.Following;

        await sut.handle(command);

        let entity = await followingRepo.findOne({ userId: userId });
        expect(entity.following.length).to.be.eq(2);
    });

    it('should create new entity when not existing', async () => {
        let command = new FollowUser(notFollowingUser, uuid.v4()),
            followingRepo = await queriesDbContext.Following;

        await sut.handle(command);

        let count = await followingRepo.count({ userId: notFollowingUser });
        expect(count).to.be.eq(1);
    });

    after(async () => {
        let repo = await queriesDbContext.Following;
        await repo.deleteMany({ userId: notFollowingUser });
        await repo.deleteMany({ userId: userId });
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
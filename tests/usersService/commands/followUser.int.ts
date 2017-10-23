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
        let repo = await queriesDbContext.Relationships;
        await repo.insert({ fromId: userId, toId: followedUserId });
    });

    it('should do nothing when user is already following', async () => {
        let command = new FollowUser(userId, followedUserId),
            followingRepo = await queriesDbContext.Relationships,
            followingRepoSpy = chai.spy.on(followingRepo, "insert");

        await sut.handle(command);

        expect(followingRepoSpy).to.not.have.been.called;
    });

    it('should create new entity when not existing', async () => {
        let command = new FollowUser(notFollowingUser, uuid.v4()),
            followingRepo = await queriesDbContext.Relationships;

        await sut.handle(command);

        let count = await followingRepo.count({ fromId: notFollowingUser });
        expect(count).to.be.eq(1);
    });

    after(async () => {
        let repo = await queriesDbContext.Relationships;
        await repo.drop();
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
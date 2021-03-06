import * as uuid from 'uuid';
import * as chai from 'chai';
import * as sinon from 'sinon';
import 'mocha';
import { QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { IRepository, DbFactory, RepositoryFactory } from '../../../src/common/infrastructure/db';
import { FollowUserCommandHandler, FollowUser } from '../../../src/usersService/commands/followUser';
import { IPublisher } from '../../../src/common/services/publisher';
import { IntegrationTestsConfig } from '../../config';
import { Message } from '../../../src/common/services/message';
import { Events, Exchanges } from '../../../src/common/events';

const expect = chai.expect;

describe('FollowUserCommandHandler', () => {
    const userId = uuid.v4(),
        notFollowingUser = uuid.v4(),
        followedUserId = uuid.v4(),
        dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        dbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory);

    let mockPublisher,
        sut;

    before(async () => {
        const repo = await dbContext.Relationships;
        await repo.insert({ fromId: userId, toId: followedUserId });
    });

    beforeEach(() => {
        mockPublisher = {
            publish: (t) => { }
        };

        sut = new FollowUserCommandHandler(dbContext, mockPublisher);
    });

    it('should do nothing when relation already exists', async () => {
        const command = new FollowUser(userId, followedUserId, true),
            followingRepo = await dbContext.Relationships;

        await sut.handle(command);

        const count = await followingRepo.count({ fromId: userId });
        expect(count).to.be.eq(1);
    });

    it('should remove relation', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            followingRepo = await dbContext.Relationships;

        await sut.handle(new FollowUser(newUserId, newFollowedId, true));

        const count = await followingRepo.count({ fromId: newUserId });
        expect(count).to.be.eq(1);

        await sut.handle(new FollowUser(newUserId, newFollowedId, false));

        const count2 = await followingRepo.count({ fromId: newUserId });
        expect(count2).to.be.eq(0);
    });

    it('should create new entity when not existing', async () => {
        const command = new FollowUser(uuid.v4(), uuid.v4(), true),
            followingRepo = await dbContext.Relationships;

        await sut.handle(command);

        const count = await followingRepo.count({ fromId: command.followerId });
        expect(count).to.be.eq(1);
    });

    it('should publish follow event', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            command = new FollowUser(newUserId, newFollowedId, true),
            followingRepo = await dbContext.Relationships,
            spy = sinon.spy(mockPublisher, 'publish');

        await sut.handle(command);

        expect(spy.called).to.be.true;

        const arg = spy.args[0][0];
        expect(arg['routingKey']).to.be.eq(Events.UserFollowed);
        expect(arg['exchangeName']).to.be.eq(Exchanges.Users);
        expect(arg['data']['followerId']).to.be.eq(command.followerId);
        expect(arg['data']['followedId']).to.be.eq(command.followedId);
    });

    it('should publish unfollow event', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            followingRepo = await dbContext.Relationships;

        await sut.handle(new FollowUser(newUserId, newFollowedId, true));

        const spy = sinon.spy(mockPublisher, 'publish');

        await sut.handle(new FollowUser(newUserId, newFollowedId, false));

        expect(spy.called).to.be.true;

        const arg = spy.args[0][0];
        expect(arg['routingKey']).to.be.eq(Events.UserUnfollowed);
        expect(arg['exchangeName']).to.be.eq(Exchanges.Users);
        expect(arg['data']['followerId']).to.be.eq(newUserId);
        expect(arg['data']['followedId']).to.be.eq(newFollowedId);
    });

    it('should not publish unfollow event if relationship does not exist', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            command = new FollowUser(newUserId, newFollowedId, false),
            followingRepo = await dbContext.Relationships,
            spy = sinon.spy(mockPublisher, 'publish');

        await sut.handle(command);

        expect(spy.calledWith({ exchangeName: Exchanges.Users, routingKey: Events.UserUnfollowed })).to.not.be.true;
    });

    after(async () => {
        const repo = await dbContext.Relationships;
        await repo.drop();
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
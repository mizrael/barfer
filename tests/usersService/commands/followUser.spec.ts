import * as sinon from 'sinon';
import { FollowUserCommandHandler, FollowUser } from '../../../src/usersService/commands/followUser';
import * as uuid from 'uuid';
import { Exchanges, Events } from '../../../src/common/events';
import { expect } from "chai";

describe('FollowUserCommandHandler', () => {

    let mockRelsRepo,
        mockQueriesDb,
        mockPublisher,
        sut;

    beforeEach(() => {
        mockRelsRepo = {
            findOne: () => Promise.resolve({})
        };

        mockQueriesDb = {
            Relationships: Promise.resolve(mockRelsRepo)
        };

        mockPublisher = {
            publish: (t) => { }
        };

        sut = new FollowUserCommandHandler(mockQueriesDb, mockPublisher);
    });

    it('should publish refresh follower user details event', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            command = new FollowUser(newUserId, newFollowedId, true),
            spy = sinon.spy(mockPublisher, 'publish');

        await sut.handle(command);

        expect(spy.called).to.be.true;

        const arg = spy.args[1][0];
        expect(arg['routingKey']).to.be.eq(Events.RequestUpdateUserData);
        expect(arg['exchangeName']).to.be.eq(Exchanges.Users);
        expect(arg['data']).to.be.eq(command.followerId);
    });

    it('should publish refresh followed user details event', async () => {
        const newUserId = uuid.v4(),
            newFollowedId = uuid.v4(),
            command = new FollowUser(newUserId, newFollowedId, true),
            spy = sinon.spy(mockPublisher, 'publish');

        await sut.handle(command);

        expect(spy.called).to.be.true;

        const arg = spy.args[0][0];
        expect(arg['routingKey']).to.be.eq(Events.RequestUpdateUserData);
        expect(arg['exchangeName']).to.be.eq(Exchanges.Users);
        expect(arg['data']).to.be.eq(command.followedId);
    });

});
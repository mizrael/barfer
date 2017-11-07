// import * as uuid from 'uuid';
// import * as chai from 'chai';
// import * as spies from 'chai-spies';
// import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
// import 'mocha';
// import { CommandsDbContext } from '../../../src/common/infrastructure/dbContext';
// import { IRepository, DbFactory, RepositoryFactory } from '../../../src/common/infrastructure/db';
// import { FollowUserCommandHandler, FollowUser } from '../../../src/usersService/commands/followUser';
// import { IPublisher } from '../../../src/common/services/publisher';
// import { IntegrationTestsConfig } from '../../config';
// import { Message } from '../../../src/common/services/message';

// const expect = chai.expect;
// chai.use(spies);

// const mockPublisher = new Mock<IPublisher>(),
//     publisher = mockPublisher.setup(p => p.publish)
//         .returns((t) => { })
//         .object(),
//     publisherSpy = chai.spy.on(publisher, 'publish');

// describe('FollowUserCommandHandler', () => {
//     const userId = uuid.v4(),
//         notFollowingUser = uuid.v4(),
//         followedUserId = uuid.v4();

//     let dbFactory = new DbFactory(),
//         repoFactory = new RepositoryFactory(dbFactory),
//         dbContext = new CommandsDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
//         sut = new FollowUserCommandHandler(dbContext, publisher);

//     before(async (done) => {
//         let repo = await dbContext.Relationships;
//         await repo.insert({ fromId: userId, toId: followedUserId });
//         done();
//     });

//     it('should do nothing when relation already exists', async () => {
//         let command = new FollowUser(userId, followedUserId, true),
//             followingRepo = await dbContext.Relationships;

//         await sut.handle(command);

//         let count = await followingRepo.count({ fromId: userId });
//         expect(count).to.be.eq(1);
//     });

//     it('should remove relation', async () => {
//         let newUserId = uuid.v4(),
//             newFollowedId = uuid.v4(),
//             command = new FollowUser(newUserId, newFollowedId, true),
//             followingRepo = await dbContext.Relationships;

//         await sut.handle(command);

//         let count = await followingRepo.count({ fromId: newUserId });
//         expect(count).to.be.eq(1);

//         command = new FollowUser(newUserId, newFollowedId, false);

//         await sut.handle(command);

//         count = await followingRepo.count({ fromId: newUserId });
//         expect(count).to.be.eq(0);
//     });

//     it('should create new entity when not existing', async () => {
//         let command = new FollowUser(uuid.v4(), uuid.v4(), true),
//             followingRepo = await dbContext.Relationships;

//         await sut.handle(command);

//         let count = await followingRepo.count({ fromId: command.followerId });
//         expect(count).to.be.eq(1);
//     });

//     it('should publish follow event', async () => {
//         let newUserId = uuid.v4(),
//             newFollowedId = uuid.v4(),
//             command = new FollowUser(newUserId, newFollowedId, true),
//             followingRepo = await dbContext.Relationships;

//         publisherSpy.reset();

//         await sut.handle(command);

//         mockPublisher.verify(pub => pub.publish(It.Is<Message>(e => e.routingKey == "follow" &&
//             e.exchangeName == "users" &&
//             e.data.followerId == command.followerId &&
//             e.data.followedId == command.followedId)),
//             Times.AtMostOnce());

//         expect(publisherSpy).to.have.been.called.once;
//     });

//     it('should publish unfollow event', async () => {
//         let newUserId = uuid.v4(),
//             newFollowedId = uuid.v4(),
//             command = new FollowUser(newUserId, newFollowedId, true),
//             followingRepo = await dbContext.Relationships;

//         await sut.handle(command);

//         publisherSpy.reset();

//         command = new FollowUser(newUserId, newFollowedId, false);
//         await sut.handle(command);

//         mockPublisher.verify(pub => pub.publish(It.Is<Message>(e => e.routingKey == "unfollow" &&
//             e.exchangeName == "users" &&
//             e.data.followerId == command.followerId &&
//             e.data.followedId == command.followedId)),
//             Times.AtMostOnce());

//         expect(publisherSpy).to.have.been.called.once;
//     });

//     it('should not publish unfollow event if relationship does not exist', async () => {
//         let newUserId = uuid.v4(),
//             newFollowedId = uuid.v4(),
//             command = new FollowUser(newUserId, newFollowedId, false),
//             followingRepo = await dbContext.Relationships;

//         publisherSpy.reset();

//         await sut.handle(command);

//         mockPublisher.verify(pub => pub.publish(It.Is<Message>(e => e.routingKey == "unfollow")),
//             Times.Never());

//         expect(publisherSpy).to.not.have.been.called();
//     });

//     after(async (done) => {
//         let repo = await dbContext.Relationships;
//         await repo.drop();
//         await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
//         done();
//     });

// });
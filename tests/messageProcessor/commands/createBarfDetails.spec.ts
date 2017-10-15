import { expect } from 'chai';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { Commands } from '../../../src/common/infrastructure/entities/commands';
import { ICommandsDbContext, IQueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Message } from '../../../src/common/services/message';
import { IPublisher } from '../../../src/common/services/publisher';
import { CreateBarfDetailsHandler, CreateBarfDetails } from '../../../src/messageProcessor/command/createBarfDetails';
import { IUserService } from '../../../src/messageProcessor/services/userService';
import { ObjectId } from 'mongodb';


const mockBarfsRepo = new Mock<IRepository<Commands.Barf>>(),
    mockCommandsDb = new Mock<ICommandsDbContext>(),
    mockBarfsQueryRepo = new Mock<IRepository<Commands.Barf>>(),
    mockQueriesDb = new Mock<IQueriesDbContext>(),
    mockPublisher = new Mock<IPublisher>(),
    mockUserService = new Mock<IUserService>(),
    user = {
        user_id: "123134234",
        nickname: "mizrael"
    },
    creationDate = Date.now(),
    barf = {
        id: ObjectId.createFromTime(creationDate),
        userId: user.user_id,
        creationDate: creationDate,
        text: "lorem ipsum dolor amet"
    },
    sut = new CreateBarfDetailsHandler(mockUserService.object(), mockPublisher.object(), mockCommandsDb.object(), mockQueriesDb.object());

describe('CreateBarfDetailsHandler', () => {
    beforeEach(() => {
        mockBarfsRepo.setup(repo => repo.insert)
            .returns((e) => Promise.resolve());
        mockCommandsDb.setup(ctx => ctx.Barfs)
            .returns(Promise.resolve(mockBarfsRepo.object()));
        mockQueriesDb.setup(ctx => ctx.Barfs)
            .returns(Promise.resolve(mockBarfsQueryRepo.object()));
        mockPublisher.setup(p => p.publish)
            .returns((t) => { });
        mockBarfsQueryRepo.setup(repo => repo.insert)
            .returns((e) => Promise.resolve());
        mockBarfsRepo.setup(repo => repo.findOne)
            .returns((e) => Promise.resolve(barf));
        mockUserService.setup(s => s.readUser)
            .returns((e) => Promise.resolve(user));
    });

    it('should create entity', () => {
        let command = new CreateBarfDetails(barf.id.toHexString());

        return sut.handle(command).then(() => {
            mockBarfsQueryRepo.verify(repo => repo.insert(It.Is<Queries.Barf>(e => e.id == barf.id && e.userName == user.nickname && e.userId == user.user_id && e.text == barf.text)),
                Times.AtMostOnce());
        });
    });

    it('should publish barf ready event', () => {
        let command = new CreateBarfDetails(barf.id.toHexString());;

        return sut.handle(command).then(() => {
            mockPublisher.verify(p => p.publish(It.Is<Message>(t => t.exchangeName == "barfs" && t.routingKey == "barf.ready" && t.data != '')),
                Times.AtMostOnce());
        });
    });
});
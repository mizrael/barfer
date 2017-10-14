import { expect } from 'chai';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';
import { ICommandsDbContext } from '../../../src/common/infrastructure/dbContext';
import { IPublisher } from '../../../src/common/services/publisher';
import { CreateBarfCommandHandler, CreateBarf } from '../../../src/barfsService/commands/createBarf';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Commands } from '../../../src/common/infrastructure/entities/commands';
import { Message } from '../../../src/common/services/message';

const mockBarfsRepo = new Mock<IRepository<Commands.Barf>>(),
    mockCommandsDb = new Mock<ICommandsDbContext>(),
    mockPublisher = new Mock<IPublisher>(),
    sut = new CreateBarfCommandHandler(mockCommandsDb.object(), mockPublisher.object());

describe('CreateBarfCommandHandler', () => {
    beforeEach(() => {
        mockBarfsRepo.setup(repo => repo.insert)
            .returns((e) => Promise.resolve());
        mockCommandsDb.setup(ctx => ctx.Barfs)
            .returns(Promise.resolve(mockBarfsRepo.object()));
        mockPublisher.setup(p => p.publish)
            .returns((t) => { });
    });

    it('should create entity', () => {
        let command = new CreateBarf("lorem", "ipsum");

        return sut.handle(command).then(() => {
            mockBarfsRepo.verify(repo => repo.insert(It.Is<Commands.Barf>(e => e.userId == command.authorId && e.text == command.text)),
                Times.AtMostOnce());
        });
    });

    it('should publish barf created event', () => {
        let command = new CreateBarf("lorem", "ipsum");

        return sut.handle(command).then(() => {
            mockPublisher.verify(p => p.publish(It.Is<Message>(t => t.exchangeName == "barfs" && t.routingKey == "create.barf" && t.data != '')),
                Times.AtMostOnce());
        });
    });
});
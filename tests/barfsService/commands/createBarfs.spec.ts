import * as uuid from 'uuid';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { ICommandsDbContext } from '../../../src/common/infrastructure/dbContext';
import { IPublisher } from '../../../src/common/services/publisher';
import { CreateBarfCommandHandler, CreateBarf } from '../../../src/barfsService/commands/createBarf';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Commands } from '../../../src/common/infrastructure/entities/commands';
import { Message } from '../../../src/common/services/message';
import { Events, Exchanges } from '../../../src/common/events';

let mockBarfsRepo, mockBarfsRepoSpy, mockCommandsDb, mockPublisher, mockPublisherSpy, sut;

describe('CreateBarfCommandHandler', () => {
    beforeEach(() => {
        mockBarfsRepo = {
            insert: (e) => { return Promise.resolve(); }
        };
        mockBarfsRepoSpy = sinon.spy(mockBarfsRepo, 'insert');

        mockCommandsDb = {
            Barfs: Promise.resolve(mockBarfsRepo)
        };

        mockPublisher = {
            publish: (t) => { }
        };
        mockPublisherSpy = sinon.spy(mockPublisher, 'publish');

        sut = new CreateBarfCommandHandler(mockCommandsDb as ICommandsDbContext, mockPublisher as IPublisher);
    });

    it('should create entity', () => {
        const command = new CreateBarf(uuid.v4(), "lorem", "ipsum");

        return sut.handle(command).then(() => {
            expect(mockBarfsRepoSpy.calledOnce).to.be.true;

            let arg = mockBarfsRepoSpy.args[0][0];
            expect(arg['userId']).to.be.eq(command.authorId);
            expect(arg['text']).to.be.eq(command.text);
            expect(arg['id']).to.be.eq(command.id);
        });
    });

    it('should publish barf created event', () => {
        const command = new CreateBarf(uuid.v4(), "lorem", "ipsum");

        return sut.handle(command).then(() => {
            expect(mockPublisherSpy.calledOnce).to.be.true;

            let arg = mockPublisherSpy.args[0][0];
            expect(arg['routingKey']).to.be.eq(Events.BarfCreated);
            expect(arg['exchangeName']).to.be.eq(Exchanges.Barfs);
            expect(arg['data']).to.be.eq(command.id);
        });
    });
});
import * as uuid from 'uuid';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { IPublisher } from '../../../src/common/services/publisher';
import { CreateBarfCommandHandler, CreateBarf } from '../../../src/barfsService/commands/createBarf';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Message } from '../../../src/common/services/message';
import { Events, Exchanges } from '../../../src/common/events';

let mockBarfsRepo, mockBarfsRepoSpy, mockCommandsDb, mockPublisher, mockPublisherSpy, sut;

describe('CreateBarfCommandHandler', () => {
    beforeEach(() => {
        mockBarfsRepo = {
            insert: (e) => { return Promise.resolve(); }
        };
        mockBarfsRepoSpy = sinon.spy(mockBarfsRepo, 'insert');

        mockPublisher = {
            publish: (t) => { }
        };
        mockPublisherSpy = sinon.spy(mockPublisher, 'publish');

        sut = new CreateBarfCommandHandler(mockPublisher as IPublisher);
    });

    it('should publish barf created event', () => {
        const command = new CreateBarf(uuid.v4(), "lorem", uuid.v4());

        return sut.handle(command).then(() => {
            expect(mockPublisherSpy.calledOnce).to.be.true;

            let arg = mockPublisherSpy.args[0][0];
            expect(arg['routingKey']).to.be.eq(Events.BarfCreated);
            expect(arg['exchangeName']).to.be.eq(Exchanges.Barfs);
            expect(arg['data']).to.be.eq(command);
        });
    });

    it('should sanitize input', () => {
        const command = new CreateBarf(uuid.v4(), "<script type='text/javascript'>alert('xss');</script>", uuid.v4());

        return sut.handle(command).then(() => {
            expect(mockPublisherSpy.calledOnce).to.be.true;

            let arg = mockPublisherSpy.args[0][0];
            expect(arg['routingKey']).to.be.eq(Events.BarfCreated);
            expect(arg['exchangeName']).to.be.eq(Exchanges.Barfs);
            expect(arg['data']['text']).to.be.eq("&lt;script type=\'text/javascript\'&gt;alert(\'xss\');&lt;/script&gt;");
        });
    });
});
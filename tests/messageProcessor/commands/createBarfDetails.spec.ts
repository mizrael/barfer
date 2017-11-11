import * as uuid from 'uuid';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { Commands } from '../../../src/common/infrastructure/entities/commands';
import { ICommandsDbContext, IQueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Message } from '../../../src/common/services/message';
import { IPublisher } from '../../../src/common/services/publisher';
import { CreateBarfDetailsHandler, CreateBarfDetails } from '../../../src/messageProcessor/command/createBarfDetails';
import { IUserService } from '../../../src/messageProcessor/services/userService';
import { Exchanges, Events } from '../../../src/common/events';

describe('CreateBarfDetailsHandler', () => {
    const user = {
        user_id: "123134234",
        nickname: "mizrael"
    },
        creationDate = Date.now(),
        barf = {
            id: uuid.v4(),
            userId: user.user_id,
            creationDate: creationDate,
            text: "lorem ipsum dolor amet"
        };

    let mockBarfsRepo,
        mockCommandsDb,
        mockBarfsQueryRepo,
        mockQueriesDb,
        mockPublisher,
        mockUserService,
        sut;

    beforeEach(() => {
        mockBarfsRepo = {
            insert: (e) => { return Promise.resolve(); },
            findOne: (e) => Promise.resolve(barf)
        };

        mockCommandsDb = {
            Barfs: Promise.resolve(mockBarfsRepo)
        };

        mockBarfsQueryRepo = {
            insert: (e) => { return Promise.resolve(); }
        };

        mockQueriesDb = {
            Barfs: Promise.resolve(mockBarfsQueryRepo)
        };

        mockPublisher = {
            publish: (t) => { }
        };

        mockUserService = {
            readUser: (e) => Promise.resolve(user)
        };

        sut = new CreateBarfDetailsHandler(mockUserService, mockPublisher, mockCommandsDb, mockQueriesDb);
    });

    it('should create entity', () => {
        let command = new CreateBarfDetails(barf.id),
            spy = sinon.spy(mockBarfsQueryRepo, 'insert');

        return sut.handle(command).then(() => {
            expect(spy.calledOnce).to.be.true;

            let arg = spy.args[0][0];
            expect(arg['id']).to.be.eq(barf.id);
            expect(arg['userName']).to.be.eq(user.nickname);
            expect(arg['userId']).to.be.eq(user.user_id);
            expect(arg['text']).to.be.eq(barf.text);
        });
    });

    it('should publish barf ready event', () => {
        let command = new CreateBarfDetails(barf.id),
            spy = sinon.spy(mockPublisher, 'publish');

        return sut.handle(command).then(() => {
            expect(spy.calledOnce).to.be.true;

            let arg = spy.args[0][0];
            expect(arg['routingKey']).to.be.eq(Events.BarfReady);
            expect(arg['exchangeName']).to.be.eq(Exchanges.Barfs);
            expect(arg['data']).to.be.not.null.and.to.be.not.eq('');
        });
    });
});
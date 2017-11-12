import * as sinon from 'sinon';
import { PagedCollection } from '../../../src/common/dto/pagedCollection';
import { expect } from 'chai';
import 'mocha';
import * as uuid from 'uuid';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { ICommandsDbContext, IQueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { BroadcastBarfCommandHandler, BroadcastBarf } from '../../../src/messageProcessor/app_data/jobs/continuous/processor/command/broadcastBarf';
import { Exchanges, Events } from '../../../src/common/events';

describe('BroadcastBarfCommandHandler', () => {
    const creationDate = Date.now(),
        author = {
            user_id: "123134234",
            nickname: "mizrael"
        },
        relationships: Queries.Relationship[] = [{
            fromId: uuid.v4(),
            toId: author.user_id
        },
        {
            fromId: uuid.v4(),
            toId: author.user_id
        }],
        barf: Queries.Barf = {
            id: uuid.v4(),
            userId: author.user_id,
            userName: author.nickname,
            creationDate: creationDate,
            text: "lorem ipsum dolor amet"
        };

    let mockBarfsQueryRepo, mockRelsQueryRepo, mockQueriesDb, mockPublisher;

    beforeEach(() => {
        mockBarfsQueryRepo = {
            findOne: (e) => Promise.resolve(barf)
        };
        mockRelsQueryRepo = {
            find: (e) => Promise.resolve(new PagedCollection(relationships, 0, relationships.length, relationships.length))
        };
        mockQueriesDb = {
            Barfs: Promise.resolve(mockBarfsQueryRepo),
            Relationships: Promise.resolve(mockRelsQueryRepo)
        };

        mockPublisher = {
            publish: (t) => { }
        };
    });

    it('should broadcast barf to author followers', async () => {
        const command = new BroadcastBarf(barf.id),
            sut = new BroadcastBarfCommandHandler(mockPublisher, mockQueriesDb),
            spy = sinon.spy(mockPublisher, 'publish');

        return sut.handle(command).then(() => {
            expect(spy.callCount).to.be.eq(relationships.length);

            relationships.forEach((r, i) => {
                const arg = spy.args[i][0];
                expect(arg['routingKey']).to.be.eq(Events.BarfFor + relationships[i].fromId);
                expect(arg['exchangeName']).to.be.eq(Exchanges.Barfs);
                expect(arg['data']).to.be.eq(barf);
            });
        });
    });
});
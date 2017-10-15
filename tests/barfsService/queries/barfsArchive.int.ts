import * as uuid from 'uuid';
import { expect } from 'chai';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';

import { IQueriesDbContext, QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { IRepository, DbFactory, RepositoryFactory } from '../../../src/common/infrastructure/db';
import { IntegrationTestsConfig } from '../../config';
import { BarfsArchiveQueryHandler } from '../../../src/barfsService/queries/barfsArchive';
import { ObjectId } from 'mongodb';

describe('BarfsArchiveQueryHandler', () => {
    const userId = uuid.v4(),
        followedUserId = uuid.v4(),
        followedUser2Id = uuid.v4(),
        notFollowedUserId = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        sut = new BarfsArchiveQueryHandler(queriesDbContext);

    before(async () => {
        let followRepo = await queriesDbContext.Following,
            barfsRepo = await queriesDbContext.Barfs,
            entity: Queries.Follow = {
                userId: userId,
                following: [{
                    entityId: followedUserId
                },
                {
                    entityId: followedUser2Id
                }]
            }, createBarfs = async (authorId, barfsRepo, count) => {
                for (let i = 0; i != count; ++i) {
                    let creationDate = Date.now();
                    await barfsRepo.insert({
                        id: ObjectId.createFromTime(creationDate),
                        creationDate: creationDate,
                        text: "lorem ipsum",
                        userId: authorId,
                        userName: "lorem"
                    });
                }
            };;
        await followRepo.insert(entity);
        await createBarfs(followedUserId, barfsRepo, 2);
        await createBarfs(followedUser2Id, barfsRepo, 2);
        await createBarfs(notFollowedUserId, barfsRepo, 2);
    });

    it('should return only followed users barfs', async () => {
        let query = { forUser: userId, page: 0, pageSize: 0 },
            results = await sut.handle(query);

        expect(results).not.to.be.null;
        expect(results.items).not.to.be.null;
        expect(results.items).not.to.be.empty;
        expect(results.items.length).to.be.eq(results.totalCount);

        let authorsDict = {}
        results.items.forEach((v, i) => {
            authorsDict[v.userId] = v.userId;
        });
        let authors = Object.keys(authorsDict);
        expect(authors.length).to.be.eq(2);
        expect(authors).to.contain(followedUserId);
        expect(authors).to.contain(followedUser2Id);
    });

    after(async () => {
        let followRepo = await queriesDbContext.Following,
            barfsRepo = await queriesDbContext.Barfs;
        await followRepo.deleteMany({ userId: userId });
        await barfsRepo.deleteMany({ userId: followedUserId });
        await barfsRepo.deleteMany({ userId: followedUser2Id });
        await barfsRepo.deleteMany({ userId: notFollowedUserId });
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
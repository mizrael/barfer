import * as uuid from 'uuid';
import { expect } from 'chai';
import 'mocha';

import { IQueriesDbContext, QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { IRepository, DbFactory, RepositoryFactory } from '../../../src/common/infrastructure/db';
import { IntegrationTestsConfig } from '../../config';
import { BarfsArchive, BarfsArchiveQueryHandler } from '../../../src/barfsService/queries/barfsArchive';

describe('BarfsArchiveQueryHandler', function () {
    this.timeout(10000);

    const userId = uuid.v4(),
        followedUserId = uuid.v4(),
        followedUser2Id = uuid.v4(),
        notFollowedUserId = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        sut = new BarfsArchiveQueryHandler(queriesDbContext);

    before(async () => {
        const followRepo = await queriesDbContext.Relationships,
            barfsRepo = await queriesDbContext.Barfs,
            creationDate = Date.now(),
            createBarfs = async (authorId, barfsRepo, count) => {
                for (let i = 0; i != count; ++i) {
                    await barfsRepo.insert({
                        id: uuid.v4(),
                        creationDate: creationDate,
                        text: "lorem ipsum",
                        userId: authorId,
                        userName: "lorem"
                    });
                }
            };

        await Promise.all([followRepo.insert({ fromId: userId, toId: followedUserId }),
        followRepo.insert({ fromId: userId, toId: followedUser2Id })]);

        await Promise.all([createBarfs(followedUserId, barfsRepo, 2),
        createBarfs(followedUser2Id, barfsRepo, 2),
        createBarfs(notFollowedUserId, barfsRepo, 2)]);
    });

    it('should return only followed users barfs', async () => {
        let query: BarfsArchive = { forUser: userId, author: null, page: 0, pageSize: 0 },
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
        let followRepo = await queriesDbContext.Relationships,
            barfsRepo = await queriesDbContext.Barfs;

        await followRepo.drop();
        await barfsRepo.drop();

        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
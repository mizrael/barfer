import * as uuid from 'uuid';
import { expect } from 'chai';
import 'mocha';

import { IQueriesDbContext, QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Entities } from '../../../src/common/infrastructure/entities';
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
                        picture: '',
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
        const query: BarfsArchive = { forUser: userId, author: null, hashtag: null, page: 0, pageSize: 0 },
            results = await sut.handle(query);

        expect(results).not.to.be.null;
        expect(results.items).not.to.be.null;
        expect(results.items).not.to.be.empty;
        expect(results.items.length).to.be.eq(results.totalCount);

        const authorsDict = {}
        results.items.forEach((v, i) => {
            authorsDict[v.userId] = v.userId;
        });
        const authors = Object.keys(authorsDict);
        expect(authors.length).to.be.eq(2);
        expect(authors).to.contain(followedUserId);
        expect(authors).to.contain(followedUser2Id);
    });

    it('should return only barfs by hashtag', async () => {
        const barfsRepo = await queriesDbContext.Barfs,
            creationDate = Date.now(),
            hash1 = uuid.v4();

        await barfsRepo.insert({
            id: uuid.v4(),
            creationDate: creationDate,
            text: "lorem ipsum",
            userId: uuid.v4(),
            userName: "lorem",
            picture: '',
            hashtags: [hash1, uuid.v4(), uuid.v4()]
        });
        await barfsRepo.insert({
            id: uuid.v4(),
            creationDate: creationDate,
            text: "lorem ipsum",
            userId: uuid.v4(),
            userName: "lorem",
            picture: '',
            hashtags: [uuid.v4(), hash1, uuid.v4()]
        });
        await barfsRepo.insert({
            id: uuid.v4(),
            creationDate: creationDate,
            text: "lorem ipsum",
            userId: uuid.v4(),
            userName: "lorem",
            picture: '',
            hashtags: [uuid.v4(), uuid.v4()]
        });

        const query: BarfsArchive = { forUser: null, author: null, hashtag: hash1, page: 0, pageSize: 0 },
            results = await sut.handle(query);

        expect(results).not.to.be.null;
        expect(results.items).not.to.be.null;
        expect(results.items).not.to.be.empty;
        expect(results.items.length).to.be.eq(2);

        expect(results.items[0].hashtags).to.contain(hash1);
        expect(results.items[1].hashtags).to.contain(hash1);
    });

    after(async () => {
        const followRepo = await queriesDbContext.Relationships,
            barfsRepo = await queriesDbContext.Barfs;

        await followRepo.drop();
        await barfsRepo.drop();

        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });

});
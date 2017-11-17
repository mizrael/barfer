import { expect } from 'chai';
import 'mocha';
import * as uuid from 'uuid';
import { IntegrationTestsConfig } from '../../config';
import { QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Entities } from '../../../src/common/infrastructure/entities';
import { RepositoryFactory, DbFactory } from '../../../src/common/infrastructure/db';
import { CheckRelationships, CheckRelationshipsQueryHandler } from '../../../src/usersService/queries/checkRelationships';

describe('CheckRelationshipsQueryHandler', () => {
    const userId = uuid.v4(),
        followedUserId = uuid.v4(),
        followedUser2Id = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        sut = new CheckRelationshipsQueryHandler(queriesDbContext);

    before(async () => {
        let repo = await queriesDbContext.Relationships;
        await repo.insert({ fromId: userId, toId: followedUserId });
        await repo.insert({ fromId: userId, toId: followedUser2Id });
    });

    it('should return only followed users from query', () => {
        let command = new CheckRelationships(userId, [followedUserId, uuid.v4(), followedUser2Id]);

        return sut.handle(command).then((res) => {
            expect(res).to.be.not.null;
            expect(res.length).to.be.eq(2);
        });
    });

    it('should not return user id if not followed', () => {
        let command = new CheckRelationships(userId, [uuid.v4()]);

        return sut.handle(command).then((res) => {
            expect(res).to.be.not.null;
            expect(res.length).to.be.eq(0);
        });
    });

    after(async () => {
        let repo = await queriesDbContext.Relationships;
        await repo.drop();
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });
});
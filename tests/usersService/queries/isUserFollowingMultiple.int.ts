import { expect } from 'chai';
import 'mocha';
import * as uuid from 'uuid';

import { QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { RepositoryFactory, DbFactory } from '../../../src/common/infrastructure/db';
import { IsUserFollowingMultipleQueryHandler, IsUserFollowingMultiple } from '../../../src/usersService/queries/IsUserFollowingMultiple';
import { IntegrationTestsConfig } from '../../config';

describe('IsUserFollowingMultipleQueryHandler', () => {
    const userId = uuid.v4(),
        followedUserId = uuid.v4(),
        followedUser2Id = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        sut = new IsUserFollowingMultipleQueryHandler(queriesDbContext);

    before(async () => {
        let repo = await queriesDbContext.Relationships;
        await repo.insert({ fromId: userId, toId: followedUserId });
        await repo.insert({ fromId: userId, toId: followedUser2Id });
    });

    it('should return only followed users from query', () => {
        let command = new IsUserFollowingMultiple(userId, [followedUserId, uuid.v4(), followedUser2Id]);

        return sut.handle(command).then((res) => {
            expect(res).to.be.not.null;
            expect(res.length).to.be.eq(2);
        });
    });

    it('should not return user id if not followed', () => {
        let command = new IsUserFollowingMultiple(userId, [uuid.v4()]);

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
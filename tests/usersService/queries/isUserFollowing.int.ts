import { expect } from 'chai';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';
import * as uuid from 'uuid';

import { QueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { RepositoryFactory, DbFactory } from '../../../src/common/infrastructure/db';
import { IsUserFollowingQueryHandler, IsUserFollowing } from '../../../src/usersService/queries/isUserFollowing';
import { IntegrationTestsConfig } from '../../config';

describe('IsUserFollowingQueryHandler', () => {
    const userId = uuid.v4(),
        followedUserId = uuid.v4();

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(IntegrationTestsConfig.mongoConnectionString, repoFactory),
        sut = new IsUserFollowingQueryHandler(queriesDbContext);

    before(() => {
        return queriesDbContext.Following.then(repo => {
            let entity: Queries.Follow = {
                userId: userId,
                following: [{
                    entityId: followedUserId
                }]
            };

            for (let i = 0; i != 10; ++i)
                entity.following.push({
                    entityId: uuid.v4()
                });

            return repo.insert(entity);
        });
    });

    it('should return false if user not found', () => {
        let command = new IsUserFollowing("lorem", "ipsum");

        return sut.handle(command).then((res) => {
            expect(res).to.be.false;
        });
    });

    it('should return false if user is not following', () => {
        let command = new IsUserFollowing(userId, uuid.v4());

        return sut.handle(command).then((res) => {
            expect(res).to.be.false;
        });
    });

    it('should return true if user is following', () => {
        let command = new IsUserFollowing(userId, followedUserId);

        return sut.handle(command).then((res) => {
            expect(res).to.be.true;
        });
    });

    after(async () => {
        let repo = await queriesDbContext.Following;
        await repo.deleteMany({ userId: userId });
        await dbFactory.close(IntegrationTestsConfig.mongoConnectionString);
    });
});
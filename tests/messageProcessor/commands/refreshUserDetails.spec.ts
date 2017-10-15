import { expect } from 'chai';
import { Mock, It, Times, ExpectedGetPropertyExpression } from 'moq.ts';
import 'mocha';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { ICommandsDbContext, IQueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { IUserService } from '../../../src/messageProcessor/services/userService';
import { RefreshUserDetailsCommandHandler, RefreshUserDetails } from '../../../src/messageProcessor/command/refreshUserDetails';

const mockUsersRepo = new Mock<IRepository<Queries.User>>(),
    mockBarfsRepo = new Mock<IRepository<Queries.Barf>>(),
    mockQueriesDb = new Mock<IQueriesDbContext>(),
    mockUserService = new Mock<IUserService>(),
    userBarfsCount = 42,
    user = {
        user_id: "123134234",
        nickname: "mizrael",
        name: "lorem ipsum",
        email: "my@email.com",
        picture: "http://."
    }, creationDate = Date.now(),
    sut = new RefreshUserDetailsCommandHandler(mockUserService.object(), mockQueriesDb.object());

describe('CreateBarfDetailsHandler', () => {
    beforeEach(() => {
        mockUsersRepo.setup(repo => repo.upsertOne)
            .returns((e) => Promise.resolve());

        mockBarfsRepo.setup(s => s.count)
            .returns((e) => Promise.resolve(userBarfsCount));

        mockQueriesDb.setup(ctx => ctx.Barfs)
            .returns(Promise.resolve(mockBarfsRepo.object()));
        mockQueriesDb.setup(ctx => ctx.Users)
            .returns(Promise.resolve(mockUsersRepo.object()));

        mockUserService.setup(s => s.readUser)
            .returns((e) => Promise.resolve(user));
    });

    it('should update user details', () => {
        let command = new RefreshUserDetails(user.user_id);

        return sut.handle(command).then(() => {
            mockUsersRepo.verify(repo => repo.upsertOne(It.Is(e => e['userId'] == user.user_id),
                It.Is<Queries.User>(e => e.nickname == user.nickname &&
                    e.picture == user.picture &&
                    e.name == user.name &&
                    e.barfsCount == userBarfsCount &&
                    e.email == user.email)),
                Times.AtMostOnce());
        });
    });

});
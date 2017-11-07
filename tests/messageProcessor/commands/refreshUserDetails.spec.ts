import { expect } from 'chai';
import 'mocha';
import { IRepository } from '../../../src/common/infrastructure/db';
import { Queries } from '../../../src/common/infrastructure/entities/queries';
import { ICommandsDbContext, IQueriesDbContext } from '../../../src/common/infrastructure/dbContext';
import { IUserService } from '../../../src/messageProcessor/services/userService';
import { RefreshUserDetailsCommandHandler, RefreshUserDetails } from '../../../src/messageProcessor/command/refreshUserDetails';
import * as sinon from 'sinon';

const userBarfsCount = 42,
    user = {
        user_id: "123134234",
        nickname: "mizrael",
        name: "lorem ipsum",
        email: "my@email.com",
        picture: "http://."
    }, creationDate = Date.now();

let mockUsersRepo,
    mockBarfsRepo,
    mockQueriesDb,
    mockUserService,
    sut;

describe('CreateBarfDetailsHandler', () => {
    beforeEach(() => {
        mockUsersRepo = {
            upsertOne: (f, e) => Promise.resolve(e)
        };

        mockBarfsRepo = {
            count: (e) => Promise.resolve(userBarfsCount)
        };

        mockQueriesDb = {
            Barfs: Promise.resolve(mockBarfsRepo),
            Users: Promise.resolve(mockUsersRepo)
        };

        mockUserService = {
            readUser: (e) => Promise.resolve(user)
        };

        sut = new RefreshUserDetailsCommandHandler(mockUserService, mockQueriesDb);
    });

    it('should update user details', () => {
        let command = new RefreshUserDetails(user.user_id),
            spy = sinon.spy(mockUsersRepo, 'upsertOne');

        return sut.handle(command).then(() => {
            expect(spy.calledOnce).to.be.true;

            let arg = spy.args[0][1];
            expect(arg['picture'], 'invalid picture').to.be.eq(user.picture);
            expect(arg['nickname'], 'invalid nickname').to.be.eq(user.nickname);
            expect(arg['userId'], 'invalid userId').to.be.eq(user.user_id);
            expect(arg['name'], 'invalid name').to.be.eq(user.name);
            expect(arg['email'], 'invalid email').to.be.eq(user.email);
            expect(arg['barfsCount'], 'invalid barfsCount').to.be.eq(userBarfsCount);
        });
    });

});
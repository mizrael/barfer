import { IQueriesDbContext, ICommandsDbContext } from '../../common/infrastructure/dbContext';
import { IPublisher } from '../../common/services/publisher';
import { ICommand, ICommandHandler } from '../../common/cqrs/command';
import { IUserService } from '../services/userService';
import { Queries } from '../../common/infrastructure/entities/queries';

export class RefreshUserDetails implements ICommand {
    constructor(public readonly userId: string) { }
}

export class RefreshUserDetailsCommandHandler implements ICommandHandler<RefreshUserDetails>{
    public constructor(private readonly _userService: IUserService,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public async handle(command: RefreshUserDetails): Promise<void> {
        let user = await this._userService.readUser(command.userId);
        if (!user)
            return Promise.resolve();

        let barfsRepo = await this._queriesDbContext.Barfs,
            barfsCount = await barfsRepo.count({
                userId: user.user_id
            }),
            userDetails = new Queries.User();

        userDetails.email = user.email;
        userDetails.name = user.name;
        userDetails.nickname = user.nickname;
        userDetails.picture = user.picture;
        userDetails.userId = user.user_id;
        userDetails.barfsCount = barfsCount;

        let usersRepo = await this._queriesDbContext.Users;

        await usersRepo.upsertOne({ userId: userDetails.userId }, userDetails);

        return Promise.resolve();
    }

}
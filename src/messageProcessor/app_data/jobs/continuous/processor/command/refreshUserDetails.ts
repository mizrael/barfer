import { IQueriesDbContext } from '../../../../../../common/infrastructure/dbContext';
import { IPublisher } from '../../../../../../common/services/publisher';
import { ICommand, ICommandHandler } from '../../../../../../common/cqrs/command';
import { IUserService } from '../services/userService';
import { Entities } from '../../../../../../common/infrastructure/entities';
import * as logger from '../../../../../../common/services/logger';
export class RefreshUserDetails implements ICommand {
    constructor(public readonly userId: string) { }
}

export class RefreshUserDetailsCommandHandler implements ICommandHandler<RefreshUserDetails>{
    public constructor(private readonly _userService: IUserService,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public async handle(command: RefreshUserDetails) {
        logger.info("refreshing user details for " + command.userId);

        const user = await this._userService.readUser(command.userId);
        if (!user)
            return;

        const barfsRepo = await this._queriesDbContext.Barfs,
            barfsCount = await barfsRepo.count({
                userId: user.user_id
            }),
            usersRepo = await this._queriesDbContext.Users,
            creationDate = new Date(user.created_at),
            userDetails: Entities.User = {
                userId: user.user_id,
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                picture: user.picture,
                creationDate: creationDate.getTime(),
                barfsCount: barfsCount
            };

        await usersRepo.upsertOne({ userId: userDetails.userId }, userDetails);
    }

}
import { IQueriesDbContext } from '../../common/infrastructure/dbContext';
import { ICommand, ICommandHandler } from "../../common/cqrs/command";
import { IPublisher } from "../../common/services/publisher";
import { Message } from "../../common/services/message";
import { Events, Exchanges } from "../../common/events";
import { Entities } from "../../common/infrastructure/entities";

export class FollowUser implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string, public readonly status: boolean) { }
}

export class FollowUserCommandHandler implements ICommandHandler<FollowUser>{
    constructor(private readonly _dbContext: IQueriesDbContext, private readonly _publisher: IPublisher) { }

    public async handle(command: FollowUser): Promise<void> {
        const entity: Entities.Relationship = {
            fromId: command.followerId,
            toId: command.followedId
        }, repo = await this._dbContext.Relationships;

        if (!command.status) {
            const deletedCount = await repo.deleteMany(entity);
            if (0 !== deletedCount) {
                const msg = new Message(Exchanges.Users, Events.UserUnfollowed, command);
                await this._publisher.publish(msg);
            }
        } else {
            const isFollowing = await repo.findOne(entity);
            if (!isFollowing) {
                await repo.insert(entity);
                const msg = new Message(Exchanges.Users, Events.UserFollowed, command);
                await this._publisher.publish(msg);
            }
        }

        await this._publisher.publish(new Message(Exchanges.Users, Events.RequestUpdateUserData, command.followedId));
        await this._publisher.publish(new Message(Exchanges.Users, Events.RequestUpdateUserData, command.followerId));
    }
}
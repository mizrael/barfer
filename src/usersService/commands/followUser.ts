import { ICommand, ICommandHandler } from "../../common/cqrs/command";
import { ICommandsDbContext } from "../../common/infrastructure/dbContext";
import { IPublisher } from "../../common/services/publisher";
import { Commands } from "../../common/infrastructure/entities/commands";
import { ObjectId } from "mongodb";
import { Message } from "../../common/services/message";

export class FollowUser implements ICommand {
    constructor(public readonly followerId: string, public readonly followedId: string, public readonly status: boolean) { }
}

export class FollowUserCommandHandler implements ICommandHandler<FollowUser>{
    constructor(private readonly _dbContext: ICommandsDbContext, private readonly _publisher: IPublisher) { }

    public async handle(command: FollowUser): Promise<void> {
        console.log("user api: " + JSON.stringify(command));

        let entity: Commands.Relationship = {
            fromId: command.followerId,
            toId: command.followedId
        },
            repo = await this._dbContext.Relationships;
        if (!command.status) {

            console.log("user api: unfollow");

            let deletedCount = await repo.deleteMany(entity);
            if (0 !== deletedCount) {
                let task = new Message("users", "user.unfollow", command);
                await this._publisher.publish(task);
            }
            return;
        }

        console.log("user api: follow");

        let isFollowing = await repo.findOne(entity);
        if (!isFollowing) {
            await repo.insert(entity);
        }

        let task = new Message("users", "user.follow", command);
        await this._publisher.publish(task);
    }
}
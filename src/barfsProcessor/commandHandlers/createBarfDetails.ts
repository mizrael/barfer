import { ObjectId } from 'mongodb';

import { IUserService } from '../services/userService';
import { Commands } from '../../common/infrastructure/entities/commands';
import { Queries } from '../../common/infrastructure/entities/queries';

import { ICommandsDbContext, IQueriesDbContext } from '../../common/infrastructure/dbContext';
import { Task } from '../../common/services/task';
import { IPublisher } from '../../common/services/publisher';

import { ICommand, ICommandHandler } from '../../common/cqrs/command';

export class CreateBarfDetails implements ICommand {
    constructor(public readonly barfId: string) { }
}

export class CreateBarfDetailsHandler implements ICommandHandler<CreateBarfDetails>{
    public constructor(private readonly _userService: IUserService,
        private readonly _publisher: IPublisher,
        private readonly _commandsDbContext: ICommandsDbContext,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public handle(command: CreateBarfDetails) {
        let barfId = new ObjectId(command.barfId);

        return this._commandsDbContext.Barfs.then(repo => {
            repo.findOne({ _id: barfId }).then((barf: Commands.Barf) => {
                console.log("processing barf: " + JSON.stringify(barf));

                this._userService.readUser(barf.userId).then(user => {
                    let barfDetails = new Queries.Barf(barf.id,
                        user.user_id,
                        user.nickname,
                        barf.text,
                        barf.creationDate);

                    this._queriesDbContext.Barfs.then(repo => {
                        repo.insert(barfDetails).then(() => {
                            let task = new Task("barfs", "barf.ready", barfDetails);
                            this._publisher.publish(task);

                            console.log("barf details created: " + JSON.stringify(barfDetails));
                        });
                    });
                });
            });
        });
    }
}
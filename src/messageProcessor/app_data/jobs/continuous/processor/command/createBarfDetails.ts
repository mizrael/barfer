import { IUserService } from '../services/userService';
import { Commands } from '../../../../../../common/infrastructure/entities/commands';
import { Queries } from '../../../../../../common/infrastructure/entities/queries';

import { ICommandsDbContext, IQueriesDbContext } from '../../../../../../common/infrastructure/dbContext';
import { Message } from '../../../../../../common/services/message';
import { IPublisher } from '../../../../../../common/services/publisher';

import { ICommand, ICommandHandler } from '../../../../../../common/cqrs/command';
import { Exchanges, Events } from '../../../../../../common/events';

import * as logger from '../../../../../../common/services/logger';

export class CreateBarfDetails implements ICommand {
    constructor(public readonly barfId: string) { }
}

export class CreateBarfDetailsHandler implements ICommandHandler<CreateBarfDetails>{
    public constructor(private readonly _userService: IUserService,
        private readonly _publisher: IPublisher,
        private readonly _commandsDbContext: ICommandsDbContext,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public async handle(command: CreateBarfDetails): Promise<void> {
        let barfsCmdRepo = await this._commandsDbContext.Barfs,
            barfsQueryRepo = await this._queriesDbContext.Barfs,
            barf = await barfsCmdRepo.findOne({ id: command.barfId }),
            user = await this._userService.readUser(barf.userId),
            barfDetails: Queries.Barf = {
                id: barf.id,
                userId: user.user_id,
                userName: user.nickname,
                picture: user.picture,
                text: barf.text,
                creationDate: barf.creationDate
            };

        await barfsQueryRepo.insert(barfDetails);

        logger.info("barf details created, publishing events... " + JSON.stringify(barfDetails));

        this._publisher.publish(new Message(Exchanges.Barfs, Events.BarfReady, command.barfId));

        this._publisher.publish(new Message(Exchanges.Users, Events.RequestUpdateUserData, barf.userId));
    }
}
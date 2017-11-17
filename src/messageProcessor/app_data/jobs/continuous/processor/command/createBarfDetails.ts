import { IUserService } from '../services/userService';
import { Entities } from '../../../../../../common/infrastructure/entities';

import { IQueriesDbContext } from '../../../../../../common/infrastructure/dbContext';
import { Message } from '../../../../../../common/services/message';
import { IPublisher } from '../../../../../../common/services/publisher';

import { ICommand, ICommandHandler } from '../../../../../../common/cqrs/command';
import { Exchanges, Events } from '../../../../../../common/events';

import * as logger from '../../../../../../common/services/logger';

interface CreateBarfData {
    id: string;
    text: string;
    authorId: string;
}

export class CreateBarfDetails implements ICommand {
    constructor(public readonly barf: CreateBarfData) { }
}

export class CreateBarfDetailsHandler implements ICommandHandler<CreateBarfDetails>{
    public constructor(private readonly _userService: IUserService,
        private readonly _publisher: IPublisher,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public async handle(command: CreateBarfDetails): Promise<void> {
        const user = await this._userService.readUser(command.barf.authorId);
        if (!user) {
            logger.info("unable to find barf author: " + command.barf.authorId);
            return;
        }

        const barfsQueryRepo = await this._queriesDbContext.Barfs,
            barfDetails: Entities.Barf = {
                id: command.barf.id,
                userId: user.user_id,
                userName: user.nickname,
                picture: user.picture,
                text: command.barf.text,
                creationDate: Date.now()
            };
        await barfsQueryRepo.insert(barfDetails);

        logger.info("barf details created, publishing events... " + JSON.stringify(barfDetails));

        this._publisher.publish(new Message(Exchanges.Barfs, Events.BarfReady, command.barf.id));

        this._publisher.publish(new Message(Exchanges.Users, Events.RequestUpdateUserData, user.user_id));
    }
}
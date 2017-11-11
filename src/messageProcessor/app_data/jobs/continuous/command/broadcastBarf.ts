import { Message } from '../../../../../common/services/message';
import { ICommand, ICommandHandler } from '../../../../../common/cqrs/command';
import { Exchanges, Events } from '../../../../../common/events';
import { IPublisher } from '../../../../../common/services/publisher';
import { IQueriesDbContext } from '../../../../../common/infrastructure/dbContext';
import { Query } from '../../../../../common/infrastructure/db';
import * as logger from '../../../../../common/services/logger';

export class BroadcastBarf implements ICommand {
    constructor(public readonly barfId: string) { }
}

export class BroadcastBarfCommandHandler implements ICommandHandler<BroadcastBarf>{
    public constructor(private readonly _publisher: IPublisher,
        private readonly _queriesDbContext: IQueriesDbContext) { }

    public async handle(command: BroadcastBarf): Promise<void> {
        const barfsQueryRepo = await this._queriesDbContext.Barfs,
            barf = await barfsQueryRepo.findOne({ id: command.barfId });

        if (!barf) {
            logger.error("unable to broadcast barf, invalid id: " + command.barfId);
            return;
        }

        const relsRepo = await this._queriesDbContext.Relationships,
            relsFilter = new Query({
                toId: barf.userId
            }),
            followers = await relsRepo.find(relsFilter);

        logger.info("broadcasting barf '" + command.barfId + "' to " + followers.totalCount + " users...");

        if (!followers || !followers.totalCount)
            return;

        followers.items.forEach(f => {
            const key = Events.BarfFor + f.fromId;

            logger.info("broadcasting barf '" + command.barfId + "' to " + key);

            this._publisher.publish(new Message(Exchanges.Barfs, key, barf));
        });
    }
}
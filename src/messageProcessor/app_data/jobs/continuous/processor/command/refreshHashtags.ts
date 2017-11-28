import { IDbFactory } from '../../../../../../common/infrastructure/db';
import { ICommandHandler, ICommand } from '../../../../../../common/cqrs/command';
import * as logger from '../../../../../../common/services/logger';
import { ObjectID } from 'bson';

export class RefreshHashtags implements ICommand {
    constructor() { }
}

export class RefreshHashtagsHandler implements ICommandHandler<RefreshHashtags>{
    public constructor(private readonly dbFactory: IDbFactory, private readonly connString: string) { }

    async handle(command: RefreshHashtags): Promise<void> {
        logger.info("refreshing hashtags...");

        const db = await this.dbFactory.getDb(this.connString),
            coll = db.collection("barfs");

        await db.collection("hashtags").drop();

        coll.aggregate([{ $unwind: "$hashtags" },
        { $group: { _id: "$hashtags", score: { "$sum": 1 } } },
        { $project: { text: "$_id", score: 1, _id: 0 } },
        { $out: "hashtags" }], async () => {
            logger.info("refreshing hashtags complete!");

            await db.collection("hashtags").createIndex({ text: 1 });
            await db.collection("hashtags").createIndex({ score: 1 });
        });

    }
}
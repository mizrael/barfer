import * as express from 'express';
import * as jwtAuthz from 'express-jwt-authz';

import { MongoClient } from 'mongodb';
import { Task } from '../../common/services/task';
import { IPublisher } from '../../common/services/publisher';
import { CommandsDbContext, QueriesDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Commands } from '../../common/infrastructure/entities/commands';
import { Queries } from '../../common/infrastructure/entities/queries';
import { ICreateBarf } from '../dto/barf';
import { PagedCollection } from '../../common/dto/pagedCollection';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';

export class BarfsController implements IController {
    constructor(private app: express.Application, private commandsDbCtx: CommandsDbContext, private queriesDbCtx: QueriesDbContext, private publisher: IPublisher) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(jwtAuthz(['create:barfs']), this.postBarf.bind(this));
    }

    private getBarfs(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Barfs.then(repo => {
            let pageSize = Math.min(100, NumberUtils.safeParseInt(req.query.pageSize)),
                page = NumberUtils.safeParseInt(req.query.page),
                query = new Query({}, { _id: -1 }, !pageSize ? 10 : pageSize, page);

            repo.find(query).then(items => {
                res.json(items);
            });
        });
    }

    private postBarf(req: express.Request, res: express.Response) {
        this.commandsDbCtx.Barfs.then(repo => {
            let me = this,
                command = req.body as ICreateBarf,
                barf = new Commands.Barf(command.authorId, command.text);

            repo.insert(barf)
                .then((result) => {
                    let task = new Task("barfs", "create.barf", barf.id.toHexString());
                    me.publisher.publish(task);
                    res.status(201).json(barf);
                });
        });
    }
}
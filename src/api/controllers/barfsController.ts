import * as express from 'express';
import * as jwtAuthz from 'express-jwt-authz';

import { MongoClient } from 'mongodb';
import { IPublisher, Task } from '../../common/services/publisher';
import { CommandsDbContext, QueriesDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Commands } from '../../common/infrastructure/entities/commands';
import { Queries } from '../../common/infrastructure/entities/queries';
import { ICreateBarf } from '../dto/barf';

export class BarfsController {
    constructor(private app: express.Application, private commandsDbCtx: CommandsDbContext, private queriesDbCtx: QueriesDbContext, private publisher: IPublisher) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(jwtAuthz(['create:barfs']), this.postBarf.bind(this));
    }

    private getBarfs(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Barfs.then(repo => {
            let filter = new Query({}, { _id: -1 });
            repo.find(filter).then(items => { res.json(items); });
        });
    }

    private postBarf(req: express.Request, res: express.Response) {
        this.commandsDbCtx.Barfs.then(repo => {
            let me = this,
                command = req.body as ICreateBarf,
                barf = new Commands.Barf(command.authorId, command.text);

            repo.insert(barf)
                .then((result) => {
                    let task = new Task("barf_created", barf.id.toHexString());
                    me.publisher.publishTask('barfs', task);
                    res.status(201).json(barf);
                });
        });
    }
}
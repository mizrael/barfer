import * as express from 'express';
import * as jwtAuthz from 'express-jwt-authz';

import { MongoClient } from 'mongodb';
import { IPublisher, Task } from '../../common/services/publisher';
import { IRepository } from '../../common/infrastructure/baseRepository';
import { Barf } from '../../common/infrastructure/entities/barf';
import { ICreateBarf } from '../dto/barf';

export class BarfsController {
    constructor(private app: express.Application, private barfsRepo: IRepository<Barf>, private publisher: IPublisher) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(jwtAuthz(['create:barfs']), this.postBarf.bind(this));
    }

    private getBarfs(req: express.Request, res: express.Response) {
        this.barfsRepo.find({}).then(items => { res.json(items); });
    }

    private postBarf(req: express.Request, res: express.Response) {
        let me = this,
            command = req.body as ICreateBarf,
            barf = new Barf(req.user.sub, command.text);
        this.barfsRepo.insert(barf)
            .then((result) => {
                let task = new Task("barf_created", barf.id.toHexString());
                me.publisher.publishTask('barfs', task);
                res.status(201).json(barf);
            });
    }
}
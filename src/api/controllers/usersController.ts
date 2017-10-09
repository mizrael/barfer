import * as express from 'express';

import { QueriesDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Queries } from '../../common/infrastructure/entities/queries';


export class UsersController {
    constructor(private app: express.Application, private queriesDbCtx: QueriesDbContext) {
        app.route('/users')
            .get(this.getUsers.bind(this));

        app.route('/users/recommended')
            .get(this.getRecommendedUsers.bind(this));

        app.route('/users/top')
            .get(this.getTopUsers.bind(this));
    }

    private getUsers(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Users.then(repo => {
            let query = new Query({}, { _id: -1 });
            repo.find(query).then(items => { res.json(items); });
        });
    }

    private getRecommendedUsers(req: express.Request, res: express.Response) {

    }

    private getTopUsers(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Users.then(repo => {
            let query = new Query({}, { barfsCount: -1 }, 10);
            repo.find(query).then(items => { res.json(items); });
        });
    }
}
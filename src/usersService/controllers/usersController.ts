import { PagedCollection } from '../../common/dto/pagedCollection';
import * as express from 'express';

import { QueriesDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Queries } from '../../common/infrastructure/entities/queries';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';


export class UsersController implements IController {
    constructor(private app: express.Application, private queriesDbCtx: QueriesDbContext) {
        app.route('/users')
            .get(this.getUsers.bind(this));

        app.route('/users/recommended')
            .get(this.getRecommendedUsers.bind(this));

        app.route('/users/top')
            .get(this.getTopUsers.bind(this));

        app.route('/users/:userId/barfs')
            .get(this.getUserBarfs.bind(this));
    }

    private getUsers(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Users.then(repo => {
            let query = new Query({}, { _id: -1 });
            repo.find(query).then(items => { res.json(items); });
        });
    }

    private getRecommendedUsers(req: express.Request, res: express.Response) {

    }

    private getUserBarfs(req: express.Request, res: express.Response) {
        let userId = req.params.userId,
            pageSize = Math.min(100, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page);

        this.queriesDbCtx.Barfs.then(repo => {
            let query = new Query({ userId: userId }, { _id: -1 }, pageSize, page);

            repo.find(query).then(items => {
                res.json(items);
            });
        });
    }

    private getTopUsers(req: express.Request, res: express.Response) {
        this.queriesDbCtx.Users.then(repo => {
            let query = new Query({}, { barfsCount: -1 }, 10);
            repo.find(query).then(items => { res.json(items); });
        });
    }
}
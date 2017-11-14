import * as express from 'express';

import { PagedCollection } from '../../common/dto/pagedCollection';

import { NumberUtils } from '../../common/utils/numberUtils';
import { IController } from '../../common/web/IController';
import { IQueryHandler } from '../../common/cqrs/query';
import { Queries } from '../../common/infrastructure/entities/queries';
import { BarfsByUser } from '../queries/barfsByUser';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly barfsByUserHandler: IQueryHandler<BarfsByUser, PagedCollection<Queries.Barf>>) {

        app.route('/users/:userId/barfs')
            .get(this.getBarfsByUser.bind(this));
    }

    private getBarfsByUser(req: express.Request, res: express.Response) {
        const userId = req.params.userId,
            pageSize = NumberUtils.safeParseInt(req.query.pageSize),
            page = NumberUtils.safeParseInt(req.query.page);

        this.barfsByUserHandler.handle(new BarfsByUser(userId, page, pageSize)).then(items => {
            res.json(items);
        });
    }
}
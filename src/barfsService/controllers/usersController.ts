import * as express from 'express';

import { PagedCollection } from '../../common/dto/pagedCollection';

import { UserBarfs } from '../queries/userBarfs';
import { NumberUtils } from '../../common/utils/numberUtils';
import { IController } from '../../common/web/IController';
import { IQueryHandler } from '../../common/cqrs/query';
import { Queries } from '../../common/infrastructure/entities/queries';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly userBarfsHandler: IQueryHandler<UserBarfs, PagedCollection<Queries.Barf>>) {

        app.route('/users/:userId/barfs')
            .get(this.getBarfsByUser.bind(this));
    }

    private getBarfsByUser(req: express.Request, res: express.Response) {
        let userId = req.params.userId,
            pageSize = NumberUtils.safeParseInt(req.query.pageSize),
            page = NumberUtils.safeParseInt(req.query.page);

        this.userBarfsHandler.handle(new UserBarfs(userId, page, pageSize)).then(items => {
            res.json(items);
        });
    }
}
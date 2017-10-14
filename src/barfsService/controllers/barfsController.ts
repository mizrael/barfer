import * as express from 'express';
import * as jwtAuthz from 'express-jwt-authz';

import { QueriesDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';

import { Queries } from '../../common/infrastructure/entities/queries';

import { PagedCollection } from '../../common/dto/pagedCollection';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';
import { ICommandHandler } from '../../common/cqrs/command';
import { CreateBarf } from '../commands/createBarf';
import { BarfsArchive } from '../queries/barfsArchive';
import { IQueryHandler } from '../../common/cqrs/query';

export class BarfsController implements IController {
    constructor(private readonly app: express.Application,
        private readonly createBarfHandler: ICommandHandler<CreateBarf>,
        private readonly barfsArchiveHandler: IQueryHandler<BarfsArchive, PagedCollection<Queries.Barf>>) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(jwtAuthz(['create:barfs']), this.postBarf.bind(this));
    }

    private getBarfs(req: express.Request, res: express.Response) {
        let pageSize = Math.min(100, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page),
            query = new BarfsArchive(pageSize, page);
        this.barfsArchiveHandler.handle(query).then((items) => {
            res.json(items);
        });
    }

    private postBarf(req: express.Request, res: express.Response) {
        let command = req.body as CreateBarf;
        this.createBarfHandler.handle(command).then(() => {
            res.status(201).json();
        });
    }
}
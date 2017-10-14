import { PagedCollection } from '../../common/dto/pagedCollection';
import * as express from 'express';

import { QueriesDbContext, CommandsDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Queries } from '../../common/infrastructure/entities/queries';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';
import { IPublisher } from '../../common/services/publisher';
import { Commands } from '../../common/infrastructure/entities/commands';

import { Task } from '../../common/services/task';
import { IQueryHandler } from '../../common/cqrs/query';
import { TopUsers } from '../queries/topUsers';
import { UserBarfs } from '../queries/userBarfs';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly topUsersHandler: IQueryHandler<TopUsers, Queries.User[]>,
        private readonly userBarfsHandler: IQueryHandler<UserBarfs, PagedCollection<Queries.Barf>>,
        private readonly commandsDbCtx: CommandsDbContext,
        private readonly publisher: IPublisher) {

        app.route('/users/:userId/follow')
            .post(this.postFollow.bind(this));

        app.route('/users/top')
            .get(this.getTopUsers.bind(this));

        app.route('/users/:userId/barfs')
            .get(this.getUserBarfs.bind(this));
    }

    private getTopUsers(req: express.Request, res: express.Response) {
        this.topUsersHandler.handle({}).then(items => { res.json(items); });
    }

    private getUserBarfs(req: express.Request, res: express.Response) {
        let userId = req.params.userId,
            pageSize = NumberUtils.safeParseInt(req.query.pageSize),
            page = NumberUtils.safeParseInt(req.query.page);

        this.userBarfsHandler.handle(new UserBarfs(userId, page, pageSize)).then(items => {
            res.json(items);
        });
    }

    private postFollow(req: express.Request, res: express.Response) {
        // this.commandsDbCtx.Following.then(repo => {
        //     let me = this,
        //         command = req.body as IFollow,
        //         entity = new Commands.Following(command.follower, command.followed);

        //     repo.insert(entity)
        //         .then((result) => {
        //             let task = new Task("user", "following", entity.id.toHexString());
        //             me.publisher.publish(task);
        //             res.status(201).json(true);
        //         });
        // });
    }

}
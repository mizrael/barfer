import { PagedCollection } from '../../common/dto/pagedCollection';
import * as express from 'express';

import { ICommandsDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Queries } from '../../common/infrastructure/entities/queries';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';


import { Message } from '../../common/services/message';
import { IQueryHandler } from '../../common/cqrs/query';
import { TopUsers } from '../queries/topUsers';
import { UserBarfs } from '../queries/userBarfs';
import { ICommandHandler } from '../../common/cqrs/command';
import { FollowUser } from '../commands/followUser';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly topUsersHandler: IQueryHandler<TopUsers, Queries.User[]>,
        private readonly userBarfsHandler: IQueryHandler<UserBarfs, PagedCollection<Queries.Barf>>,
        private readonly followUserHandler: ICommandHandler<FollowUser>) {

        app.route('/users/:userId/follow')
            .post(this.postFollow.bind(this));

        app.route('/users/top')
            .get(this.getTopUsers.bind(this));

        app.route('/users/:userId/checkIfFollows')
            .get(this.checkIfFollows.bind(this));

        app.route('/users/:userId/barfs')
            .get(this.getUserBarfs.bind(this));
    }

    private checkIfFollows(req: express.Request, res: express.Response) {
        this.topUsersHandler.handle({}).then(items => { res.json(items); });
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
        let userToFollow = req.params.userId,
            followerId = req.body.followerId,
            command = new FollowUser(followerId, userToFollow);

        console.log("service: " + JSON.stringify(command));
        this.followUserHandler.handle(command).then(() => res.status(201).json());
    }

}
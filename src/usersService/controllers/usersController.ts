import { PagedCollection } from '../../common/dto/pagedCollection';
import * as express from 'express';

import { ICommandsDbContext } from '../../common/infrastructure/dbContext';
import { Query } from '../../common/infrastructure/db';
import { Queries } from '../../common/infrastructure/entities/queries';
import { IController } from '../../common/web/IController';
import { NumberUtils } from '../../common/utils/numberUtils';

import { Message } from '../../common/services/message';
import { IQueryHandler } from '../../common/cqrs/query';
import { TopUsers, User } from '../queries/topUsers';
import { ICommandHandler } from '../../common/cqrs/command';
import { FollowUser } from '../commands/followUser';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly topUsersHandler: IQueryHandler<TopUsers, User[]>,
        private readonly followUserHandler: ICommandHandler<FollowUser>) {

        app.route('/users/:userId/follow')
            .post(this.postFollow.bind(this));

        app.route('/users/top')
            .get(this.getTopUsers.bind(this));
    }

    private getTopUsers(req: express.Request, res: express.Response) {
        let query: TopUsers = {
            forUser: req.query.forUser as string
        };
        this.topUsersHandler.handle(query).then(items => { res.json(items); });
    }

    private postFollow(req: express.Request, res: express.Response) {
        let userToFollow = req.params.userId as string,
            followerId = req.body.followerId as string,
            status = req.body.status as boolean,
            command = new FollowUser(followerId, userToFollow, status);

        this.followUserHandler.handle(command).then(() => res.status(201).json());
    }

}
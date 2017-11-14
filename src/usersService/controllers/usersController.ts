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
import { ICommandHandler } from '../../common/cqrs/command';
import { FollowUser } from '../commands/followUser';
import { GetUserById } from '../queries/userById';
import { User } from '../queries/dto';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly topUsersHandler: IQueryHandler<TopUsers, User[]>,
        private readonly followUserHandler: ICommandHandler<FollowUser>,
        private readonly userIdHandler: IQueryHandler<GetUserById, User>) {

        app.route('/users/:userId')
            .get(this.getDetails.bind(this));

        app.route('/users/:userId/follow')
            .post(this.postFollow.bind(this));

        app.route('/users')
            .get(this.getUsers.bind(this));
    }

    private getDetails(req: express.Request, res: express.Response) {
        const userId = req.params.userId as string,
            forUser = req.query.forUser as string;
        this.userIdHandler.handle({
            forUser: forUser,
            nickname: userId
        }).then(u => {
            res.json(u);
        });
    }

    private getUsers(req: express.Request, res: express.Response) {
        const query: TopUsers = {
            forUser: req.query.forUser as string,
            pageSize: NumberUtils.safeParseInt(req.query.take)
        };
        this.topUsersHandler.handle(query).then(items => { res.json(items); });
    }

    private postFollow(req: express.Request, res: express.Response) {
        const userToFollow = req.params.userId as string,
            followerId = req.body.followerId as string,
            status = req.body.status as boolean,
            command = new FollowUser(followerId, userToFollow, status);

        this.followUserHandler.handle(command).then(() => res.status(201).json());
    }

}
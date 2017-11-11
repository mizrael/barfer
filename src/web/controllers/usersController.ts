import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IUserService } from '../services/userService';
import { NumberUtils } from '../../common/utils/numberUtils';
import { ensureLoggedIn } from 'connect-ensure-login';
import { RequestUtils } from '../../common/utils/requestUtils';

export class UsersController implements IController {
    constructor(private readonly app: express.Application, private readonly userService: IUserService) {
        app.route('/users/top').get(this.top.bind(this));
        app.route('/users/follow').post(ensureLoggedIn(), this.follow.bind(this));
    }

    private top(req: express.Request, res: express.Response) {
        const loggedUserId = RequestUtils.getLoggedUserId(req);
        this.userService.readTopUsers(loggedUserId).then(results => {
            res.render('partials/_topUsers', { topUsers: results });
        }).catch(err => {
            res.json(err);
        });
    }

    private follow(req: express.Request, res: express.Response) {
        let status: boolean = req.body.status as boolean,
            command = { followedId: req.body.followedId, followerId: req.user['_json'].sub, status: status };

        this.userService.follow(command).then(() => {
            res.status(201).json({ status: status });
        });
    }
}
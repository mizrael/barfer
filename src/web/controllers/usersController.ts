import { IBarfService } from '../services/barfService';
import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IUserService } from '../services/userService';
import { NumberUtils } from '../../common/utils/numberUtils';
import { ensureLoggedIn } from 'connect-ensure-login';
import { RequestUtils } from '../../common/utils/requestUtils';

export class UsersController implements IController {
    constructor(private readonly app: express.Application,
        private readonly userService: IUserService,
        private readonly barfService: IBarfService) {
        app.route('/topusers').get(this.top.bind(this));
        app.route('/users/:userId').get(this.details.bind(this));
        app.route('/users/:userId/follow').post(ensureLoggedIn(), this.follow.bind(this));
    }

    private top(req: express.Request, res: express.Response) {
        const loggedUserId = RequestUtils.getLoggedUserId(req);
        this.userService.readTopUsers(loggedUserId).then(results => {
            res.render('partials/_topUsers', { topUsers: results });
        }).catch(err => {
            res.json(err);
        });
    }

    private async details(req: express.Request, res: express.Response) {
        const userId = req.params.userId as string,
            loggedUserId = RequestUtils.getLoggedUserId(req),
            user = await this.userService.readOne({ forUser: loggedUserId, userId: userId }),
            userBarfs = await this.barfService.read({ author: userId, page: 0, pageSize: 10 });
        res.locals.model = user;
        res.locals.barfs = userBarfs;
        res.locals.area = 'user';
        res.render('areas/user');
    }

    private follow(req: express.Request, res: express.Response) {
        const status: boolean = req.body.status as boolean,
            loggedUserId = RequestUtils.getLoggedUserId(req),
            command = { followedId: req.params.userId, followerId: loggedUserId, status: status };

        this.userService.follow(command).then(() => {
            res.status(201).json({ status: status });
        });
    }
}
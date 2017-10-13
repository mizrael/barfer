import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IUserService } from '../services/userService';
import { NumberUtils } from '../../common/utils/numberUtils';

export class UsersController implements IController {
    constructor(private readonly app: express.Application, private readonly userService: IUserService) {
        app.route('/users/top').get(this.top.bind(this));
    }

    private top(req: express.Request, res: express.Response) {
        this.userService.readTopUsers().then(results => {
            res.render('partials/_topUsers', { topUsers: results });
        }).catch(err => {
            res.json(err);
        });
    }
}
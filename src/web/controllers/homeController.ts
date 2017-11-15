import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IBarfService } from '../services/barfService';
import { IUserService } from '../services/userService';
import { ensureLoggedIn } from 'connect-ensure-login';

export class HomeController implements IController {
    constructor(private readonly app: express.Application) {
        app.route('/').get(ensureLoggedIn(), this.index.bind(this));
    }

    private index(req: express.Request, res: express.Response) {
        res.locals.area = 'home';
        res.render('areas/home');
    }
}
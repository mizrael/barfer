import * as express from 'express';
import { IController } from '../../common/web/IController';

export class HomeController implements IController {
    constructor(private app: express.Application) {
        app.route('/').get(this.index.bind(this));
    }

    private index(req: express.Request, res: express.Response) {
        res.locals.area = 'home';
        res.render('areas/home');
    }

}
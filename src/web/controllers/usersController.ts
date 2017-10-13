import * as express from 'express';
import { IController } from '../../common/web/IController';

export class UsersController implements IController {
    constructor(private app: express.Application) {
        app.route('/top').get(this.top.bind(this));
    }

    private top(req: express.Request, res: express.Response) {

    }

}
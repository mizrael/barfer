import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';

export class AuthController implements IController {
    constructor(private readonly app: express.Application, private readonly authService: IAuthService) {
        app.route('/login').get(this.authService.authenticate(), this.login.bind(this));
        app.route('/logout').get(this.logout.bind(this));

        app.route('/callback').get(this.authService.authenticate(), this.callback.bind(this));
    }

    private login(req: express.Request, res: express.Response) {
        req.logout();
        res.redirect(req.session.returnTo || '/');
    }

    private logout(req: express.Request, res: express.Response) {
        res.redirect('/');
    }

    private callback(req: express.Request, res: express.Response) {
        res.redirect(req.session.returnTo || '/');
    }
}
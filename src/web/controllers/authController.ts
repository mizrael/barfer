import { Subscriber, SubscriberOptions } from '../../common/services/subscriber';
import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';
import { Queries } from '../../common/infrastructure/entities/queries';
import { RequestUtils } from '../../common/utils/requestUtils';
import { Exchanges, Events } from '../../common/events';
import * as logger from '../../common/services/logger';

export class AuthController implements IController {
    constructor(private readonly app: express.Application, private readonly authService: IAuthService) {
        app.route('/login').get(this.login.bind(this));

        app.route('/do-login').get(this.authService.authenticate(), this.doLogin.bind(this));
        app.route('/callback').get(this.authService.authenticate(), this.callback.bind(this));
        app.route('/logout').get(this.logout.bind(this));
    }

    private login(req: express.Request, res: express.Response) {
        res.locals.area = 'preLogin';
        res.render('areas/pre-login');
    }

    private doLogin(req: express.Request, res: express.Response) {
        req.logout();
        res.redirect(req.session.returnTo || '/');
    }

    private logout(req: express.Request, res: express.Response) {
        req.logout();
        res.redirect(req.session.returnTo || '/');
    }

    private callback(req: express.Request, res: express.Response) {
        res.redirect(req.session.returnTo || '/');
    }
}
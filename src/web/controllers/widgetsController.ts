import { IBarfService } from '../services/barfService';
import { IController } from '../../common/web/IController';
import { IUserService } from '../services/userService';
import { RequestUtils } from '../../common/utils/requestUtils';
import * as express from 'express';
import { xhrOnly } from '../middlewares/xhrOnly';
import { ensureLoggedIn } from 'connect-ensure-login';

export class WidgetsController implements IController {
    constructor(private readonly app: express.Application,
        private readonly userService: IUserService,
        private readonly barfService: IBarfService) {

        app.route('/widgets/users').get(ensureLoggedIn(), xhrOnly(), this.users.bind(this));
        app.route('/widgets/tagcloud').get(ensureLoggedIn(), xhrOnly(), this.tagcloud.bind(this));
    }

    private users(req: express.Request, res: express.Response) {
        const loggedUserId = RequestUtils.getLoggedUserId(req),
            type = req.query.type as string,
            promise = ('latest' === type) ? this.userService.readLatest(loggedUserId) : this.userService.readTopUsers(loggedUserId),
            title = ('latest' === type) ? 'Latest Barfers' : 'Top Barfers';

        promise.then(results => {
            res.render('partials/_usersWidget', { users: results, title: title });
        }).catch(err => {
            res.json(err);
        });
    }

    private async tagcloud(req: express.Request, res: express.Response) {
        const tagCloud = await this.barfService.tagcloud();
        res.render('partials/_tagCloudWidget', { tagCloud: tagCloud });
    }
}
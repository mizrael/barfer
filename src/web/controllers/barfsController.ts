import * as express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';
import { NumberUtils } from '../../common/utils/numberUtils';
import { IBarfService } from '../services/barfService';
import { RequestUtils } from '../../common/utils/requestUtils';

export class BarfsController implements IController {
    constructor(private readonly app: express.Application, private readonly barfService: IBarfService) {
        app.route('/barfs')
            .get(ensureLoggedIn(), this.getBarfs.bind(this))
            .post(ensureLoggedIn('/login'), this.postBarf.bind(this));;
    }

    private getBarfs(req: express.Request, res: express.Response) {
        const author: string = req.query.author,
            loggedUserId = RequestUtils.getLoggedUserId(req),
            pageSize = Math.min(10, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page);

        this.barfService.read({ forUser: loggedUserId, author: author, page: page, pageSize: pageSize }).then(results => {
            res.render('partials/_barfs', { barfs: results });
        }).catch(err => {
            res.json(err);
        });
    }

    private postBarf(req: express.Request, res: express.Response) {
        let dto = { text: req.body.text, authorId: req.user['_json'].sub };
        this.barfService.save(dto).then(() => {
            res.json(true);
        });
    }
}

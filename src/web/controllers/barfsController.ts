import * as express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';
import { NumberUtils } from '../../common/utils/numberUtils';
import { IBarfService } from '../services/barfService';
import { RequestUtils } from '../../common/utils/requestUtils';
import { xhrOnly } from '../middlewares/xhrOnly';

export class BarfsController implements IController {
    constructor(private readonly app: express.Application, private readonly barfService: IBarfService) {
        app.route('/barfs')
            .get(ensureLoggedIn(), xhrOnly(), this.getBarfs.bind(this))
            .post(ensureLoggedIn(), xhrOnly(), this.postBarf.bind(this));

        app.route('/barfs/:barfId').get(this.barfDetails.bind(this));

        app.route('/hashtag/:hashtag').get(this.getByHashtag.bind(this));
    }

    private barfDetails(req: express.Request, res: express.Response) {
        const id = req.params.barfId as string;
        this.barfService.readOne(id).then(barf => {
            res.locals.model = barf;
            res.locals.area = 'barf';
            res.render('areas/barf');
        });
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

    private getByHashtag(req: express.Request, res: express.Response) {
        const hashtag = req.params.hashtag as string,
            pageSize = Math.min(10, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page);

        this.barfService.read({ hashtag: hashtag, page: page, pageSize: pageSize }).then(results => {
            res.locals.model = results;
            res.locals.area = 'hashtag';
            res.render('areas/hashtag');
        });
    };

    private postBarf(req: express.Request, res: express.Response) {
        let dto = { text: req.body.text, authorId: req.user['_json'].sub };
        this.barfService.save(dto).then(() => {
            res.json(true);
        });
    }
}

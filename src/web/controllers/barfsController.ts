import * as express from 'express';
import * as ensureLoggedIn from 'connect-ensure-login';
import * as request from 'request-promise';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';
import { NumberUtils } from '../../common/utils/numberUtils';
import { IBarfService } from '../services/barfService';

const router = express.Router(),
    serviceUrl = 'http://localhost:3000/barfs';

export class BarfsController implements IController {
    constructor(private app: express.Application, private barfService: IBarfService) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(this.postBarf.bind(this));;
    }

    private getBarfs(req: express.Request, res: express.Response) {
        let pageSize = Math.min(10, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page);

        this.barfService.read(page, pageSize).then(results => {
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

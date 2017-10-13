import * as express from 'express';
import * as ensureLoggedIn from 'connect-ensure-login';
import * as request from 'request-promise';
import { IController } from '../../common/web/IController';
import { IAuthService } from '../services/authService';
import { NumberUtils } from '../../common/utils/numberUtils';

const router = express.Router(),
    serviceUrl = 'http://localhost:3000/barfs';

export class BarfsController implements IController {
    constructor(private app: express.Application, private authService: IAuthService) {
        app.route('/barfs')
            .get(this.getBarfs.bind(this))
            .post(this.postBarf.bind(this));;
    }

    private getBarfs(req: express.Request, res: express.Response) {
        let pageSize = Math.min(10, NumberUtils.safeParseInt(req.query.pageSize)),
            page = NumberUtils.safeParseInt(req.query.page),
            url = serviceUrl + "?pageSize=" + pageSize + "&page=" + page,
            headers = {
                'content-type': 'application/json'
            },
            options = {
                url: url,
                method: 'GET',
                headers: headers
            };
        request(options).then(json => {
            let barfs = JSON.parse(json);
            res.render('partials/_barfs', { barfs: barfs });
        }).catch(err => {
            res.json(err);
        });
    }

    private postBarf(req: express.Request, res: express.Response) {
        this.authService.requestAccessToken()
            .then(data => {
                let
                    headers = {
                        'content-type': 'application/json',
                        'Authorization': 'Bearer ' + data['access_token']
                    },
                    body = { text: req.body.text, authorId: req.user['_json'].sub },
                    options = {
                        url: serviceUrl,
                        method: 'POST',
                        headers: headers,
                        body: body,
                        json: true
                    };
                request(options).then(json => {
                    res.json(json);
                }).catch(err => {
                    res.json(err);
                });
            }).catch(err => {
                res.json(err);
            });
    }
}

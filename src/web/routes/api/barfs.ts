import * as express from 'express';
import * as ensureLoggedIn from 'connect-ensure-login';
import * as authService from '../../services/barfsService';
import * as request from 'request-promise';

const router = express.Router();

router.get('/', ensureLoggedIn.ensureLoggedIn(), function (req, res, next) {
    authService.requestAccessToken()
        .then(data => {
            let
                headers = {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + data['access_token']
                },
                options = {
                    url: 'http://localhost:3000/barfs',
                    method: 'GET',
                    headers: headers
                };
            request(options).then(barfs => {
                res.json(barfs);
            }).catch(err => {
                res.json(err);
            });
        }).catch(err => {
            res.json(err);
        });
});

export default function route(app: express.Application) {
    app.use("/api/barfs", router);
}
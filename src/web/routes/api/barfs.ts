import * as express from 'express';
import * as ensureLoggedIn from 'connect-ensure-login';
import * as authService from '../../services/authService';
import * as request from 'request-promise';

const router = express.Router(),
    serviceUrl = 'http://localhost:3000/barfs';

router.get('/', function (req, res, next) {
    let
        headers = {
            'content-type': 'application/json'
        },
        options = {
            url: serviceUrl,
            method: 'GET',
            headers: headers
        };
    request(options).then(json => {
        let barfs = JSON.parse(json);
        res.render('partials/_barfs', { barfs: barfs });
    }).catch(err => {
        res.json(err);
    });
});

router.post('/', function (req, res, next) {
    authService.requestAccessToken()
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
});

export default function route(app: express.Application) {
    app.use("/api/barfs", router);
}
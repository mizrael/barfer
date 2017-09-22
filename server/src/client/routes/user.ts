import * as express from 'express';
import * as ensureLoggedIn from 'connect-ensure-login';

const router = express.Router();
router.get('/', ensureLoggedIn.ensureLoggedIn(), function (req, res, next) {
    res.json(req.user);
});

export default function route(app: express.Application) {
    app.use("/user", router);
}
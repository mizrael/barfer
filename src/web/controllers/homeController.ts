import * as express from 'express';
import { IController } from '../../common/web/IController';
import { IBarfService } from '../services/barfService';
import { IUserService } from '../services/userService';

export class HomeController implements IController {
    constructor(private readonly app: express.Application, private readonly barfService: IBarfService, private readonly userService: IUserService) {
        app.route('/').get(this.index.bind(this));
        app.route('/barfs/:barfId').get(this.barfDetails.bind(this));
    }

    private index(req: express.Request, res: express.Response) {
        res.locals.area = 'home';
        res.render('areas/home');
    }

    private barfDetails(req: express.Request, res: express.Response) {
        const id = req.params.barfId as string;
        this.barfService.readOne(id).then(barf => {
            res.locals.model = barf;
            res.locals.area = 'barf';
            res.render('areas/barf');
        });
    }
}
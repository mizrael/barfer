import * as uuid from 'uuid';
import * as express from 'express';

export function viewUtils(): express.RequestHandler {


    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.locals.utils = {
            uuid: uuid.v4
        };
        next();
    };
}
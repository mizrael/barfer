import * as express from 'express';

export interface XhrOptions {
    redirectOnFailureUrl: string;
}

export function xhrOnly(options?: XhrOptions): express.RequestHandler {
    options = options || {
        redirectOnFailureUrl: '/'
    };

    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!req.xhr) {
            res.redirect(options.redirectOnFailureUrl);
        } else if (next) {
            next();
        }
    };
}
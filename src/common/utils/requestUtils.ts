import { Request } from 'express';

export class RequestUtils {
    public static getLoggedUserId(req: Request): string {
        return (req.user) ? req.user['_json'].sub : "";
    }
}
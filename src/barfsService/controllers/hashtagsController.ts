import { IQueryHandler } from '../../common/cqrs/query';
import * as express from 'express';
import { IController } from '../../common/web/IController';
import { TagCloud } from '../queries/tagCloud';
import { Entities } from '../../common/infrastructure/entities';

export class HashtagsController implements IController {
    constructor(private readonly app: express.Application,
        private readonly tagCloudHandler: IQueryHandler<TagCloud, Array<Entities.Hashtag>>) {

        app.route('/hashtags/cloud')
            .get(this.getTagCloud.bind(this));
    }

    private async getTagCloud(req: express.Request, res: express.Response) {
        const tagCloud = await this.tagCloudHandler.handle(new TagCloud());
        res.json(tagCloud);
    }
}
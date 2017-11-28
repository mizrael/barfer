import { QueriesDbContext } from '../../common/infrastructure/dbContext';
import { IQueryHandler, IQuery } from '../../common/cqrs/query';
import { Entities } from "../../common/infrastructure/entities";
import { Query } from '../../common/infrastructure/db';

export class TagCloud implements IQuery {
    constructor() { }
}

export class TagCloudQueryHandler implements IQueryHandler<TagCloud, Array<Entities.Hashtag>>{
    constructor(private readonly queriesDbCtx: QueriesDbContext) { }

    async handle(query: TagCloud): Promise<Array<Entities.Hashtag>> {
        const repo = await this.queriesDbCtx.Hashtags,
            tagsQuery = new Query({}, { score: -1 }, 10, 0),
            tags = await repo.find(tagsQuery);

        return tags.items;
    }
}
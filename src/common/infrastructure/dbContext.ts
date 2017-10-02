import { Commands } from './entities/commands';
import { Queries } from './entities/queries';
import { BaseRepository, IRepository, IRepositoryFactory } from './db';

export class CommandsDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfs", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Commands.Barf>>;
}

export class QueriesDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfsQueries", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Queries.Barf>>;
}
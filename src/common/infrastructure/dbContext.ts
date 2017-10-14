import { Commands } from './entities/commands';
import { Queries } from './entities/queries';
import { BaseRepository, IRepository, IRepositoryFactory } from './db';

export interface ICommandsDbContext {
    Barfs: Promise<IRepository<Commands.Barf>>;
    Following: Promise<IRepository<Commands.Following>>;
}

export class CommandsDbContext implements ICommandsDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfs", connectionString: connString });
        this.Following = repoFactory.create({ collectionName: "following", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Commands.Barf>>;
    public readonly Following: Promise<IRepository<Commands.Following>>;
}

export interface IQueriesDbContext {
    Barfs: Promise<IRepository<Queries.Barf>>;
}

export class QueriesDbContext implements IQueriesDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfsQueries", connectionString: connString });
        this.Users = repoFactory.create({ collectionName: "usersQueries", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Queries.Barf>>;
    public readonly Users: Promise<IRepository<Queries.User>>;
}
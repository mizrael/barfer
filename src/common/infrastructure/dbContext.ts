import { Commands } from './entities/commands';
import { Queries } from './entities/queries';
import { BaseRepository, IRepository, IRepositoryFactory } from './db';

export interface ICommandsDbContext {
    Barfs: Promise<IRepository<Commands.Barf>>;
}

export class CommandsDbContext implements ICommandsDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfs", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Commands.Barf>>;
}

export interface IQueriesDbContext {
    Barfs: Promise<IRepository<Queries.Barf>>;
    Users: Promise<IRepository<Queries.User>>;
    Following: Promise<IRepository<Queries.Follow>>;
}

export class QueriesDbContext implements IQueriesDbContext {
    public constructor(private connString: string, private repoFactory: IRepositoryFactory) {
        this.Barfs = repoFactory.create({ collectionName: "barfsQueries", connectionString: connString });
        this.Users = repoFactory.create({ collectionName: "usersQueries", connectionString: connString });
        this.Following = repoFactory.create({ collectionName: "following", connectionString: connString });
    }
    public readonly Barfs: Promise<IRepository<Queries.Barf>>;
    public readonly Users: Promise<IRepository<Queries.User>>;
    public readonly Following: Promise<IRepository<Queries.Follow>>;
}
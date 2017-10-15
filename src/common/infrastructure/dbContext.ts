import { Commands } from './entities/commands';
import { Queries } from './entities/queries';
import { BaseRepository, IRepository, IRepositoryFactory } from './db';

abstract class BaseDbContext {
    public constructor(private readonly connString: string, private readonly repoFactory: IRepositoryFactory) { }

    protected initRepo<T>(collName: string, repoName: string, onInit?: (r: IRepository<T>) => Promise<void>): Promise<IRepository<T>> {
        if (this[repoName])
            return Promise.resolve(this[repoName]);
        return this.getRepo<T>(collName).then(repo => {
            this[repoName] = repo;

            if (onInit) {
                return onInit(repo).then(r => {
                    return repo;
                });
            }
            return this[repoName];
        });
    }

    protected getRepo<T>(collName: string) {
        return this.repoFactory.create<T>({ collectionName: collName, connectionString: this.connString });
    }
}

/*********************************/

export interface ICommandsDbContext {
    Barfs: Promise<IRepository<Commands.Barf>>;
}

export class CommandsDbContext extends BaseDbContext implements ICommandsDbContext {
    public constructor(connString: string, repoFactory: IRepositoryFactory) {
        super(connString, repoFactory);
    }

    private _barfs: IRepository<Commands.Barf> = null;
    public get Barfs(): Promise<IRepository<Commands.Barf>> {
        return this.initRepo<Commands.Barf>("barfs", "_barfs");
    }
}

/*********************************/

export interface IQueriesDbContext {
    Barfs: Promise<IRepository<Queries.Barf>>;
    Users: Promise<IRepository<Queries.User>>;
    Following: Promise<IRepository<Queries.Follow>>;
}

export class QueriesDbContext extends BaseDbContext implements IQueriesDbContext {
    public constructor(connString: string, repoFactory: IRepositoryFactory) {
        super(connString, repoFactory);
    }

    private _barfs: IRepository<Queries.Barf> = null;
    public get Barfs(): Promise<IRepository<Queries.Barf>> {
        return this.initRepo<Queries.Barf>("barfsQueries", "_barfs", async (r) => {
            await r.createIndex({ userId: 1 });
        });
    }

    private _users: IRepository<Queries.User> = null;
    public get Users(): Promise<IRepository<Queries.User>> {
        return this.initRepo<Queries.User>("usersQueries", "_users", async (r) => {
            await r.createIndex({ userId: 1 });
        });
    }

    private _following: IRepository<Queries.Follow> = null;
    public get Following(): Promise<IRepository<Queries.Follow>> {
        return this.initRepo<Queries.Follow>("following", "_following", async (r) => {
            await r.createIndex({ userId: 1 });
        });
    }

}
import { Entities } from './entities';
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

export interface IQueriesDbContext {
    Barfs: Promise<IRepository<Entities.Barf>>;
    Users: Promise<IRepository<Entities.User>>;
    Relationships: Promise<IRepository<Entities.Relationship>>;
}

export class QueriesDbContext extends BaseDbContext implements IQueriesDbContext {
    public constructor(connString: string, repoFactory: IRepositoryFactory) {
        super(connString, repoFactory);
    }

    private _barfs: IRepository<Entities.Barf> = null;
    public get Barfs(): Promise<IRepository<Entities.Barf>> {
        return this.initRepo<Entities.Barf>("barfsQueries", "_barfs", async (r) => {
            await r.createIndex({ userId: 1 });
            await r.createIndex({ userName: 1 });
        });
    }

    private _users: IRepository<Entities.User> = null;
    public get Users(): Promise<IRepository<Entities.User>> {
        return this.initRepo<Entities.User>("usersQueries", "_users", async (r) => {
            await r.createIndex({ userId: 1 }, { unique: true });
        });
    }

    private _relationships: IRepository<Entities.Relationship> = null;
    public get Relationships(): Promise<IRepository<Entities.Relationship>> {
        return this.initRepo<Entities.Relationship>("relationshipsQueries", "_relationships", async (r) => {
            await r.createIndex({ from: 1 }, { unique: false });
            await r.createIndex({ to: 1 }, { unique: false });
        });
    }

}
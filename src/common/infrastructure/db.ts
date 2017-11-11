import { PagedCollection } from '../dto/pagedCollection';
import { MongoClient, Db, Collection } from 'mongodb';

export class Query {
    constructor(public readonly filter: any, public readonly sortby?: any, public readonly limit: number = 0, public readonly page: number = 0) { }
}

export class IndexOptions {
    public unique?: boolean;
    public static readonly empty: IndexOptions = {
        unique: false
    };
}

export interface IRepository<T> {
    createIndex(index, options?: IndexOptions): Promise<string>;

    find(query: Query): Promise<PagedCollection<T>>;
    findOne(filter: any): Promise<T>;
    insert(entity: T): Promise<void>;
    count(filter: any): Promise<number>;
    upsertOne(filter: any, entity: any): Promise<void>;
    deleteMany(filter: any): Promise<number>;
    drop(): Promise<void>;
}

export class BaseRepository<T> implements IRepository<T> {
    public constructor(private coll: Collection<T>) { }

    public createIndex(index, options?: IndexOptions): Promise<string> {
        options = options || IndexOptions.empty;
        return this.coll.createIndex(index, { unique: options.unique });
    }

    public findOne(filter: any): Promise<T> {
        return this.coll.findOne(filter);
    }

    public find(query: Query): Promise<PagedCollection<T>> {
        let cursor = this.coll.find<T>(query.filter),
            isPaging = (query.limit > 0);
        if (query.sortby)
            cursor = cursor.sort(query.sortby);
        if (isPaging)
            cursor = cursor.skip(query.limit * query.page).limit(query.limit);

        return cursor.map(item => {
            return this.removeMongoId(item);
        }).toArray().then(items => {
            if (!isPaging)
                return new PagedCollection<T>(items, 0, items.length, items.length);
            return this.count(query.filter).then(count => {
                let pageSize = (count < query.limit) ? count : query.limit;
                return new PagedCollection<T>(items, query.page, pageSize, count);
            });
        });
    }

    public insert(entity: T): Promise<void> {
        return this.coll.insertOne(entity).then(result => {
            this.removeMongoId(entity);
        });
    }

    public upsertOne(filter: any, entity: any): Promise<void> {
        return this.coll.updateOne(filter, entity, { upsert: true }).then(result => {
            this.removeMongoId(entity);
        });
    }

    public count(filter: any): Promise<number> {
        return this.coll.count(filter);
    }

    public drop(): Promise<void> {
        return this.coll.drop();
    }

    public deleteMany(filter: any): Promise<number> {
        return this.coll.deleteMany(filter).then(res => res.deletedCount);
    }

    private removeMongoId(entity: any) {
        if (entity._id) {
            delete entity._id;
        }

        return entity;
    }
}

/*******************************/

export interface IDbFactory {
    getDb(connectionString: string): Promise<Db>;
    close(connectionString: string): Promise<void>;
}

export class DbFactory implements IDbFactory {
    private _dbs: any;

    public constructor() {
        this._dbs = {};
    }

    public async getDb(connectionString: string): Promise<Db> {
        let db = this._dbs[connectionString] as Db;
        if (db)
            return db;
        db = await MongoClient.connect(connectionString);
        this._dbs[connectionString] = db;
        return db;
    }

    public async close(connectionString: string): Promise<void> {
        let db = await this.getDb(connectionString);
        if (!db) return;
        delete this._dbs[connectionString];
        return db.close();
    }
}

/*******************************/

export interface IRepositoryOptions {
    connectionString: string;
    collectionName: string;
}

export interface IRepositoryFactory {
    create<T>(options: IRepositoryOptions): Promise<IRepository<T>>;
}

export class RepositoryFactory implements IRepositoryFactory {
    constructor(private readonly _dbFactory: IDbFactory) { }

    public async create<T>(options: IRepositoryOptions): Promise<IRepository<T>> {
        let db = await this._dbFactory.getDb(options.connectionString),
            coll = db.collection<T>(options.collectionName),
            repo = new BaseRepository<T>(coll);

        return repo;
    }
}

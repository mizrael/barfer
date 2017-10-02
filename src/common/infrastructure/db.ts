import { MongoClient, Db, Collection } from 'mongodb';

export class Query {
    constructor(private readonly _filter: any, private readonly _sortby: any) { }

    public get filter() { return this._filter; }
    public get sortby() { return this._sortby; }
}

export interface IRepository<T> {
    find(filter: Query): Promise<T[]>;
    findOne(filter: any): Promise<T>;
    insert(entity: T): Promise<void>;
}

export class BaseRepository<T> implements IRepository<T> {
    public constructor(private coll: Collection<T>) { }

    public findOne(filter: any): Promise<T> {
        return this.coll.findOne(filter);
    }

    public find(query: Query): Promise<T[]> {
        let cursor = this.coll.find<T>(query.filter);
        if (query.sortby)
            cursor = cursor.sort(query.sortby);
        return cursor.map(item => {
            return this.renameId(item);
        }).toArray();
    }

    public insert(entity: T): Promise<void> {
        return this.coll.insertOne(entity).then(result => {
            this.renameId(entity);
        });
    }

    private renameId(entity: any) {
        entity.id = entity._id;
        delete entity._id;
        return entity;
    }
}

export interface IRepositoryOptions {
    connectionString: string;
    collectionName: string;
}

export interface IRepositoryFactory {
    create<T>(options: IRepositoryOptions): Promise<IRepository<T>>;
}

export class RepositoryFactory implements IRepositoryFactory {
    private _dbs: any;

    public constructor() {
        this._dbs = {};
    }

    private async getDb(connectionString: string): Promise<Db> {
        let db = this._dbs[connectionString];
        if (db) return Promise.resolve(db);
        db = await MongoClient.connect(connectionString);
        this._dbs[connectionString] = db;
        return db;
    }

    public async create<T>(options: IRepositoryOptions): Promise<IRepository<T>> {
        let db = await this.getDb(options.connectionString),
            coll = db.collection<T>(options.collectionName),
            repo = new BaseRepository<T>(coll);
        return repo;
    }
}
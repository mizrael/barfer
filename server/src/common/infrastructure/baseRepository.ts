import { MongoClient } from 'mongodb';

export interface IRepository<T> {
    find(query: any): Promise<T[]>;
    insert(entity: T): Promise<void>;
}

export class BaseRepository<T>{
    public constructor(private connStr: string, private collName: string) { }

    public find(query: any): Promise<T[]> {
        return MongoClient.connect(this.connStr).then(db => {
            let coll = db.collection(this.collName);
            return coll.find<T>(query)
                .map(item => {
                    return this.renameId(item);
                })
                .toArray();
        });
    }

    public insert(entity: T): Promise<void> {
        return MongoClient.connect(this.connStr)
            .then(db => {
                let coll = db.collection(this.collName);
                return coll.insertOne(entity).then(result => {
                    this.renameId(entity);
                    db.close();
                });
            });
    }

    private renameId(entity: any) {
        entity.id = entity._id;
        delete entity._id;
        return entity;
    }
}

import { MongoClient, ObjectId } from 'mongodb';

export class Barf {
    constructor(public readonly userId: string, public readonly text: string) {
        this.creationDate = Date.now();
    }
    public creationDate: Number;
    public id: ObjectId;
}
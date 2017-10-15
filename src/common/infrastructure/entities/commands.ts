import { ObjectId } from 'mongodb';

export namespace Commands {
    export interface Barf {
        userId: string;
        text: string
        creationDate: Number;
        id: ObjectId;
    }

}
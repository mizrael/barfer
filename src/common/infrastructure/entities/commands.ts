import { ObjectId } from 'mongodb';

export namespace Commands {
    export class Barf {
        constructor(public readonly userId: string, public readonly text: string) {
            this.creationDate = Date.now();
        }
        public creationDate: Number;
        public id: ObjectId;
    }
}
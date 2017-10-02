import { ObjectId } from 'mongodb';

export namespace Queries {
    export class Barf {
        constructor(public readonly id: ObjectId,
            public readonly userId: string,
            public readonly userName: string,
            public readonly text: string,
            public readonly creationDate: Number) {
        }
    }
} 
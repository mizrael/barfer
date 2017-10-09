import { ObjectId } from 'mongodb';

export namespace Queries {
    export class Barf {
        public id: ObjectId;
        public userId: string;
        public userName: string;
        public text: string;
        public creationDate: Number;
    }

    export class User {
        public userId: string;
        public nickname: string;
        public email: string;
        public name: string;
        public picture: string;
        public barfsCount: Number;
    }
} 
import { ObjectId } from 'mongodb';

export namespace Queries {
    export interface Barf {
        id: ObjectId;
        userId: string;
        userName: string;
        text: string;
        creationDate: Number;
    }

    export interface User {
        userId: string;
        nickname: string;
        email: string;
        name: string;
        picture: string;
        barfsCount: Number;
    }

    export interface Follow {

    }
} 
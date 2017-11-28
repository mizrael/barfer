export namespace Entities {
    export interface Barf {
        id: string;
        userId: string;
        userName: string;
        picture: string;
        text: string;
        creationDate: Number;
        hashtags: Array<string>;
    }

    export interface User {
        userId: string;
        nickname: string;
        email: string;
        name: string;
        picture: string;
        creationDate: Number;
        barfsCount: Number;
    }

    export interface Relationship {
        fromId: string;
        toId: string;
    }
} 
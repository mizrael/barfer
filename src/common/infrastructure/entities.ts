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
        lastLoginDate: Number;
        barfsCount: Number;
        followersCount: Number;
        followsCount: Number;
    }

    export interface Relationship {
        fromId: string;
        toId: string;
    }

    export interface Hashtag {
        text: string;
        score: number;
    }
} 
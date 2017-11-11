export namespace Commands {
    export interface Barf {
        userId: string;
        text: string
        creationDate: Number;
        id: string;
    }

    export interface Relationship {
        fromId: string;
        toId: string;
    }
}
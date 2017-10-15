export class PagedCollection<T>{
    public readonly totalPages: number;
    constructor(public readonly items: T[], public readonly page: number, public readonly pageSize: number, public readonly totalCount: number) {
        this.totalPages = Math.ceil(totalCount / pageSize);
    }

    public static empty<T>(): PagedCollection<T> {
        return new PagedCollection<T>([], 0, 0, 0);
    }
}
export class PagedCollection<T>{
    constructor(public readonly items: T[], public readonly page: number, public readonly pageSize: number, public readonly totalCount: number) { }
}
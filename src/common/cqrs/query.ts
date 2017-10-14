export interface IQuery { }

export interface IQueryHandler<TQ extends IQuery, TR> {
    handle(query: TQ): Promise<TR>;
}
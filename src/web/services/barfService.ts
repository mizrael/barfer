import { PagedCollection } from '../../common/dto/pagedCollection';
import * as Promise from 'bluebird';
import { IRestClient, RequestOptions } from '../utils/restClient';

export interface ICreateBarfCommand {
    text: string;
    authorId: string;
}

export interface IBarf {
    text: string;
    userName: string;
}

export interface IBarfsArchiveQuery {
    forUser: string;
    page: number;
    pageSize: number;
}

export interface IBarfService {
    read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>>;
    save(dto: ICreateBarfCommand): Promise<void>;
}

export class BarfService implements IBarfService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>> {
        let url = this.serviceUrl + "?pageSize=" + query.pageSize + "&page=" + query.page + "&forUser=" + query.forUser;
        return this.restClient.get<PagedCollection<IBarf>>(url, RequestOptions.PrivateJson);
    }

    public save(dto: ICreateBarfCommand): Promise<void> {
        return this.restClient.post(this.serviceUrl, dto, RequestOptions.PrivateJson);
    }
}
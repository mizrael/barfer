import { PagedCollection } from '../../common/dto/pagedCollection';
import * as Promise from 'bluebird';
import { IRestClient, RequestOptions } from '../utils/restClient';

export interface ICreateBarfCommand {
    text: string;
    authorId: string;
}

export interface IBarf {
    id: string;
    text: string;
    userName: string;
}

export interface IBarfDetails {
    id: string;
    userId: string;
    userName: string;
    picture: string;
    text: string;
    creationDate: Number;
}

export interface IBarfsArchiveQuery {
    forUser?: string;
    page: number;
    pageSize: number;
    author?: string;
}

export interface IBarfsByUserQuery {
    userId: string;
    page: number;
    pageSize: number;
}

export interface IBarfService {
    read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>>;
    readOne(id: string): Promise<IBarfDetails>;
    readByUser(query: IBarfsByUserQuery): Promise<PagedCollection<IBarf>>;
    save(dto: ICreateBarfCommand): Promise<void>;
}

export class BarfService implements IBarfService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>> {
        const url = this.serviceUrl + "/barfs?pageSize=" + query.pageSize +
            "&page=" + query.page +
            "&forUser=" + (query.forUser || '') +
            "&author=" + (query.author || '');
        return this.restClient.get<PagedCollection<IBarf>>(url, RequestOptions.PrivateJson);
    }

    public readByUser(query: IBarfsByUserQuery): Promise<PagedCollection<IBarf>> {
        const url = this.serviceUrl + "/users/" + query.userId + "/barfs?pageSize=" + query.pageSize + "&page=" + query.page;
        return this.restClient.get<PagedCollection<IBarf>>(url, RequestOptions.PrivateJson);
    }

    public readOne(id: string): Promise<IBarfDetails> {
        const url = this.serviceUrl + "/barfs/" + id;
        return this.restClient.get<IBarfDetails>(url, RequestOptions.PrivateJson);
    }

    public save(dto: ICreateBarfCommand): Promise<void> {
        return this.restClient.post(this.serviceUrl, dto, RequestOptions.PrivateJson);
    }
}
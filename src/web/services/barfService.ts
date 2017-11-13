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
    forUser: string;
    page: number;
    pageSize: number;
}

export interface IBarfService {
    read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>>;
    readOne(id: string): Promise<IBarfDetails>;
    save(dto: ICreateBarfCommand): Promise<void>;
}

export class BarfService implements IBarfService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>> {
        const url = this.serviceUrl + "?pageSize=" + query.pageSize + "&page=" + query.page + "&forUser=" + query.forUser;
        return this.restClient.get<PagedCollection<IBarf>>(url, RequestOptions.PrivateJson);
    }

    public readOne(id: string): Promise<IBarfDetails> {
        const url = this.serviceUrl + "/" + id;
        return this.restClient.get<IBarfDetails>(url, RequestOptions.PrivateJson);
    }

    public save(dto: ICreateBarfCommand): Promise<void> {
        return this.restClient.post(this.serviceUrl, dto, RequestOptions.PrivateJson);
    }
}
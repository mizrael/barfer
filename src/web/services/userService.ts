import { PagedCollection } from '../../common/dto/pagedCollection';
import * as request from 'request-promise';
import * as Promise from 'bluebird';
import { IRestClient } from '../utils/restClient';

export interface IUser {
    userId: string;
    nickname: string;
    email: string;
    name: string;
    picture: string;
    barfsCount: Number;
}

export interface IUserService {
    readTopUsers(page: number, pageSize: number): Promise<PagedCollection<IUser>>;
}

export class UserService implements IUserService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public readTopUsers(page: number, pageSize: number): Promise<PagedCollection<IUser>> {
        let url = this.serviceUrl + "?pageSize=" + pageSize + "&page=" + page;
        return this.restClient.get<PagedCollection<IUser>>(url);
    }
}
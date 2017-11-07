import { PagedCollection } from '../../common/dto/pagedCollection';
import * as request from 'request-promise';
import * as Promise from 'bluebird';
import { IRestClient, RequestOptions } from '../utils/restClient';

export interface IUser {
    userId: string;
    nickname: string;
    email: string;
    name: string;
    picture: string;
    barfsCount: Number;
}

export interface IFollowUser {
    followerId: string;
    followedId: string;
    status: boolean
}

export interface IUserService {
    readTopUsers(forUser: string): Promise<PagedCollection<IUser>>;
    follow(command: IFollowUser): Promise<void>;
}

export class UserService implements IUserService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public readTopUsers(forUser: string): Promise<PagedCollection<IUser>> {
        let url = this.serviceUrl + "/users/top?forUser=" + forUser;
        return this.restClient.get<PagedCollection<IUser>>(url);
    }

    public follow(command: IFollowUser): Promise<void> {
        let url = this.serviceUrl + "/users/" + command.followedId + "/follow";
        return this.restClient.post(url, { followerId: command.followerId, status: command.status }, RequestOptions.PrivateJson);
    }
}
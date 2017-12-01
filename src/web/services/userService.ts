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
    followersCount: Number;
    followsCount: Number;
    followed: boolean;
}

export interface IFollowUser {
    followerId: string;
    followedId: string;
    status: boolean
}

export interface UserDetailsQuery {
    userId: string;
    forUser: string;
}

export interface IUserService {
    readTopUsers(forUser: string): Promise<PagedCollection<IUser>>;
    readLatest(forUser: string): Promise<PagedCollection<IUser>>;
    follow(command: IFollowUser): Promise<void>;
    readOne(query: UserDetailsQuery): Promise<IUser>;
}

export class UserService implements IUserService {
    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public readOne(query: UserDetailsQuery): Promise<IUser> {
        const url = this.serviceUrl + "/users/" + query.userId + "?forUser=" + (query.forUser || '');
        return this.restClient.get<IUser>(url);
    }

    public readTopUsers(forUser: string): Promise<PagedCollection<IUser>> {
        const url = this.serviceUrl + "/users?orderBy=barfsCount&take=10&forUser=" + forUser;
        return this.restClient.get<PagedCollection<IUser>>(url);
    }

    public readLatest(forUser: string): Promise<PagedCollection<IUser>> {
        const url = this.serviceUrl + "/users?orderBy=creationDate&take=10&forUser=" + forUser;
        return this.restClient.get<PagedCollection<IUser>>(url);
    }

    public follow(command: IFollowUser): Promise<void> {
        const url = this.serviceUrl + "/users/" + command.followedId + "/follow";
        return this.restClient.post(url, { followerId: command.followerId, status: command.status }, RequestOptions.PrivateJson);
    }
}
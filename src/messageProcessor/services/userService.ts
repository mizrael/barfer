import * as request from 'request-promise';
import { IAuthService } from './authService';
import * as Bluebird from 'bluebird';

export interface IUser {
    email: string;
    nickname: string;
    user_id: string;
    name: string;
    picture: string;
};

export interface IUserService {
    readUser(id: string): Bluebird<IUser>;
}

export class UserService implements IUserService {
    constructor(private readonly _authService: IAuthService, private readonly _authDomain: string) { }

    private parseAuth0UserId(id: string) {
        let parts = id.split('|');
        if (!parts || 2 != parts.length) return id;
        return parts[1];
    }

    public readUser(id: string): Bluebird<IUser> {
        return this._authService.requestAccessToken()
            .then(data => {
                let userId = this.parseAuth0UserId(id),
                    headers = {
                        'Authorization': 'Bearer ' + data['access_token']
                    },
                    options = {
                        url: "https://" + this._authDomain + "/api/v2/users?q=" + userId,
                        method: 'GET',
                        headers: headers
                    };
                return request(options).then(json => {
                    let users = JSON.parse(json) as IUser[];
                    return (users.length) ? users[0] : null;
                }).catch(err => {
                    console.log(err);
                    return null;
                });
            }).catch(err => {
                console.log(err);
                return null;
            });
    };
}
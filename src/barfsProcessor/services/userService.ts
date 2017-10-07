import * as request from 'request-promise';
import { IAuthService } from './authService';
import * as Bluebird from 'bluebird';

export interface IUser {
    email: string;
    nickname: string;
    user_id: string;
    name: string;
};

export interface IUserService {
    fetchUserProfile(): Bluebird<IUser>;
}

export class UserService implements IUserService {
    constructor(private readonly _authService: IAuthService) { }

    public fetchUserProfile() {
        return this._authService.requestAccessToken()
            .then(data => {
                let
                    headers = {
                        'Authorization': 'Bearer ' + data['access_token']
                    },
                    options = {
                        url: "https://mizrael.auth0.com/api/v2/users",
                        method: 'GET',
                        headers: headers
                    };
                return request(options).then(json => {
                    let users = JSON.parse(json) as IUser[];
                    return (users.length) ? users[0] : null;
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log(err);
            });
    };
}
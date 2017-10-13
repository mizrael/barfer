import { PagedCollection } from '../../common/dto/pagedCollection';
import * as request from 'request-promise';
import * as Promise from 'bluebird';
import { IAuthService } from './authService';

export interface ICreateBarfCommand {
    text: string;
    authorId: string;
}

export interface IBarf {
    text: string;
    userName: string;
}

export interface IBarfService {
    read(page: number, pageSize: number): Promise<PagedCollection<IBarf>>;
    save(dto: ICreateBarfCommand): Promise<void>;
}

export class BarfService implements IBarfService {
    constructor(private readonly authService: IAuthService, private readonly serviceUrl: string) { }

    public read(page: number, pageSize: number): Promise<PagedCollection<IBarf>> {
        let url = this.serviceUrl + "?pageSize=" + pageSize + "&page=" + page,
            headers = {
                'content-type': 'application/json'
            },
            options = {
                url: url,
                method: 'GET',
                headers: headers
            };
        return request(options).then(json => {
            let result = JSON.parse(json) as PagedCollection<IBarf>;
            return Promise.resolve(result);
        });
    }

    public save(dto: ICreateBarfCommand): Promise<void> {
        return this.authService.requestAccessToken()
            .then(data => {
                let
                    headers = {
                        'content-type': 'application/json',
                        'Authorization': 'Bearer ' + data['access_token']
                    },
                    body = dto,
                    options = {
                        url: this.serviceUrl,
                        method: 'POST',
                        headers: headers,
                        body: body,
                        json: true
                    };
                return request(options);
            });
    }
}
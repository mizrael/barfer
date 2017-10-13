import * as request from 'request-promise';
import * as Promise from 'bluebird';
import { IAuthService } from '../services/authService';
import { RequestPromiseOptions } from 'request-promise';

export class RequestOptions {
    constructor(public readonly contentType: string = "application/json", public readonly useAuth: boolean = false) { }

    public static readonly PublicJson: RequestOptions = new RequestOptions();
    public static readonly PrivateJson: RequestOptions = new RequestOptions("application/json", true);
}

export interface IRestClient {
    get<T>(url: string, options?: RequestOptions): Promise<T>;
    post<T>(url: string, body: T, options?: RequestOptions): Promise<any>;
}

export class RestClient implements IRestClient {
    constructor(private readonly authService: IAuthService) { }

    public get<T>(url: string, options: RequestOptions = RequestOptions.PublicJson): Promise<T> {
        let headers = {
            'content-type': options.contentType
        },
            reqOpts = {
                url: url,
                method: 'GET',
                headers: headers
            };

        return this.execute(options, reqOpts, o => {
            return request(o).then(json => {
                let result = JSON.parse(json) as T;
                return result;
            });
        });
    }

    public post<T>(url: string, body: T, options: RequestOptions = RequestOptions.PrivateJson): Promise<any> {
        let
            headers = {
                'content-type': options.contentType
            },
            reqOpts = {
                url: url,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            };

        return this.execute(options, reqOpts, o => {
            return request(o);
        });
    }

    private execute<T>(options: RequestOptions, reqOpts: any, runner: (o: any) => Promise<T>) {
        if (options.useAuth) {
            return this.authService.requestAccessToken().then(data => {
                reqOpts.headers['Authorization'] = 'Bearer ' + data['access_token'];
                return runner(reqOpts);
            });
        }
        return runner(reqOpts);
    }

}
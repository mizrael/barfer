import * as request from 'request-promise';
import { config } from '../../../../../../common/config';

export interface IAuthService {
    requestAccessToken(): request.RequestPromise;
}

export class AuthService implements IAuthService {
    public constructor(private readonly _authDomain: string) { }
    public requestAccessToken() {
        let headers = { 'content-type': 'application/json' },
            options = {
                url: 'https://' + config.auth0.domain + '/oauth/token',
                method: 'POST',
                headers: headers,
                json: true,
                body: {
                    audience: "https://" + this._authDomain + "/api/v2/",
                    grant_type: 'client_credentials',
                    client_id: 'gLxvdWo4jDcgld7l1rocJmSlJu5lbglt',
                    client_secret: 'A8-KZ041ePuSakFODkUlNG7OOLjMFh-r0ZqIoIgF2VIr7eIuTG5bad00tkfcud0j'
                }
            };
        return request(options);
    }
}

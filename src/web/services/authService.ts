import * as request from 'request-promise';

export function requestAccessToken() {
    let headers = { 'content-type': 'application/json' },
        options = {
            url: 'https://' + process.env.AUTH0_DOMAIN + '/oauth/token',
            method: 'POST',
            headers: headers,
            json: true,
            body: {
                audience: "barfer-api-gateway",
                grant_type: 'client_credentials',
                client_id: 'gLxvdWo4jDcgld7l1rocJmSlJu5lbglt',
                client_secret: 'A8-KZ041ePuSakFODkUlNG7OOLjMFh-r0ZqIoIgF2VIr7eIuTG5bad00tkfcud0j'
            }
        };
    return request(options);
};
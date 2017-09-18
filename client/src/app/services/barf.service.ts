import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import { Response } from '@angular/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BarfService {
    private serviceBaseUrl: string;
    private barfCreatedSource = new Subject<ICreateBarf>();

    public barfCreated$: Observable<ICreateBarf>;

    constructor(private http: AuthHttp) {
        this.serviceBaseUrl = 'http://localhost:3000/';
        this.barfCreated$ = this.barfCreatedSource.asObservable();
    }

    public read(): Promise<IBarfArchiveItem[]> {
        let endpointUrl = this.serviceBaseUrl + 'barfs';
        return this.http.get(endpointUrl)
            .map(response => response.json() as IBarfArchiveItem[])
            .toPromise();
    }

    public save(command: ICreateBarf): Promise<Response> {
        let dto = {
            text: command.text
        }, endpointUrl = this.serviceBaseUrl + 'barfs';

        return this.http.post(endpointUrl, dto)
            .toPromise()
            .then(response => {
                this.barfCreatedSource.next(command);
                return response;
            });
    }
}

export class IBarfArchiveItem {
    id: string;
    text: string;
    userId: string;
}

export interface ICreateBarf {
    text: string;
}
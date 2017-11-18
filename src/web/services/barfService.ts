import { PagedCollection } from '../../common/dto/pagedCollection';
import * as Promise from 'bluebird';
import { IRestClient, RequestOptions } from '../utils/restClient';
import * as hashtagFinder from '../../common/utils/hashtagFinder';

export interface ICreateBarfCommand {
    text: string;
    authorId: string;
}

interface IBarfDTO {
    id: string;
    userId: string;
    userName: string;
    picture: string;
    text: string;
    creationDate: Number;
}

export interface IBarf {
    id: string;
    userId: string;
    userName: string;
    picture: string;
    text: string;
    creationDate: Number;
}

export interface IBarfsArchiveQuery {
    forUser?: string;
    page: number;
    pageSize: number;
    author?: string;
    hashtag?: string;
}

export interface IBarfsByUserQuery {
    userId: string;
    page: number;
    pageSize: number;
}

export interface IBarfService {
    read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>>;
    readOne(id: string): Promise<IBarf>;
    readByUser(query: IBarfsByUserQuery): Promise<PagedCollection<IBarf>>;
    save(dto: ICreateBarfCommand): Promise<void>;
}

export class BarfService implements IBarfService {

    constructor(private readonly serviceUrl: string, private readonly restClient: IRestClient) { }

    public read(query: IBarfsArchiveQuery): Promise<PagedCollection<IBarf>> {
        const url = this.serviceUrl + "/barfs?pageSize=" + query.pageSize +
            "&page=" + query.page +
            "&forUser=" + (query.forUser || '') +
            "&hashtag=" + (query.hashtag || '') +
            "&author=" + (query.author || '');
        return this.restClient.get<PagedCollection<IBarfDTO>>(url, RequestOptions.PrivateJson).then(this.mapBarfs.bind(this));
    }

    public readByUser(query: IBarfsByUserQuery): Promise<PagedCollection<IBarf>> {
        const url = this.serviceUrl + "/users/" + query.userId + "/barfs?pageSize=" + query.pageSize + "&page=" + query.page;
        return this.restClient.get<PagedCollection<IBarf>>(url, RequestOptions.PrivateJson).then(this.mapBarfs.bind(this));
    }

    public readOne(id: string): Promise<IBarf> {
        const url = this.serviceUrl + "/barfs/" + id;
        return this.restClient.get<IBarfDTO>(url, RequestOptions.PrivateJson).then(this.mapBarf.bind(this));
    }

    public save(dto: ICreateBarfCommand): Promise<void> {
        return this.restClient.post(this.serviceUrl + "/barfs/", dto, RequestOptions.PrivateJson);
    }

    private mapBarfs(dtos: PagedCollection<IBarfDTO>): PagedCollection<IBarf> {
        if (!dtos.items)
            return dtos;
        return new PagedCollection<IBarf>(dtos.items.map(this.mapBarf.bind(this)), dtos.page, dtos.pageSize, dtos.totalCount);
    }

    private mapBarf(dto: IBarfDTO): IBarf {
        const barf = dto as IBarf;
        barf.text = hashtagFinder.replace(barf.text, this.hashTagLinkReplacer.bind(this));
        return barf;
    }

    private hashTagLinkReplacer(match, p1) {
        const link = '/hashtag/' + p1.substr(1);
        return " <a href='" + link + "'>" + p1 + "</a>";
    }
}
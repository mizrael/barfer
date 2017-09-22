import { Barf } from './entities/barf';
import { BaseRepository } from './baseRepository';

export class BarfsRepository extends BaseRepository<Barf> {
    public constructor(connStr: string) {
        super(connStr, "barfs");
    }
}
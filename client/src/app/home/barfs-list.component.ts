import { Component } from '@angular/core';
import { BarfService, IBarfArchiveItem } from '../services/barf.service';

@Component({
    selector: 'barfs-list',
    templateUrl: './barfs-list.component.html'
})

export class BarfsListComponent {
    public models: IBarfArchiveItem[];

    constructor(private barfService: BarfService) {
        this.barfService.barfCreated$.subscribe(barf => {
            this.readItems();
        });
        this.readItems();
    }

    private async readItems() {
        this.barfService.read()
            .then(models => {
                this.models = models;
            }).catch(() => {
                this.models = [];
            });
    }
}
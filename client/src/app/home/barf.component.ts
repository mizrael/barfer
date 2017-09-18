import { Component } from '@angular/core';
import { BarfService, ICreateBarf } from '../services/barf.service';

@Component({
    selector: 'barf',
    templateUrl: './barf.component.html'
})
export class BarfComponent {
    private isSaving: boolean;
    private model: ICreateBarf;

    constructor(private barfService: BarfService) {
        this.isSaving = false;
        this.model = { text: '' };
    }

    public onSave() {
        this.isSaving = true;

        this.barfService.save(this.model)
            .then(() => {
                this.onSaveComplete();
            }).catch(() => {
                this.onSaveComplete();
            });
    }

    private onSaveComplete() {
        this.model.text = '';
        this.isSaving = false;
    }
}
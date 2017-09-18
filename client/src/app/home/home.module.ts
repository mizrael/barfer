import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { HomeComponent } from './home.component';
import { BarfComponent } from './barf.component';
import { BarfsListComponent } from './barfs-list.component';

@NgModule({
    imports: [CommonModule, SharedModule, AuthModule, FormsModule, HttpModule],
    declarations: [HomeComponent, BarfComponent, BarfsListComponent]
})

export class HomeModule { }

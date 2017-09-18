import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AUTH_PROVIDERS } from 'angular2-jwt';

import { BarfService } from './services/barf.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';

import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { AboutModule } from './about/about.module';

import 'bootstrap/dist/css/bootstrap.css';
import '../styles/main.css';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        SharedModule,
        AuthModule,
        HomeModule,
        AboutModule
    ],
    declarations: [AppComponent],
    providers: [
        BarfService,
        AUTH_PROVIDERS,
        AuthService,
        AuthGuard
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }

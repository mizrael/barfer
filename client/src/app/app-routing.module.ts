import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth-guard.service';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login.component';
import { CallbackComponent } from './auth/callback.component';
import { AboutComponent } from './about/about.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'callback', component: CallbackComponent },
    { path: 'about', component: AboutComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule]
})

export class AppRoutingModule { }

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tokenNotExpired } from 'angular2-jwt';
import * as auth0 from 'auth0-js';

export const AUTH_CONFIG = {
    CLIENT_ID: 'wRbiLUrSkXx03vB51d0glux1LyuNIjuv',
    CLIENT_DOMAIN: 'mizrael.auth0.com',
    AUDIENCE: 'barfer-api-gateway',
    REDIRECT: 'http://localhost:3030/callback',
    SCOPE: 'openid'
};

@Injectable()
export class AuthService {
    // Create Auth0 web auth instance
    // @TODO: Update AUTH_CONFIG and remove .example extension in src/app/auth/auth0-variables.ts.example
    auth0 = new auth0.WebAuth({
        clientID: AUTH_CONFIG.CLIENT_ID,
        domain: AUTH_CONFIG.CLIENT_DOMAIN,
        scope: 'read:barfs create:barfs'
    });

    // Create a stream of logged in status to communicate throughout app
    loggedIn: boolean;
    loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

    constructor(private router: Router) {
        // If authenticated, set local profile property and update login status subject
        if (this.authenticated) {
            this.setLoggedIn(true);
        }
    }

    setLoggedIn(value: boolean) {
        // Update login status subject
        this.loggedIn$.next(value);
        this.loggedIn = value;
    }

    login() {
        // Auth0 authorize request
        // Note: nonce is automatically generated: https://auth0.com/docs/libraries/auth0js/v8#using-nonce
        this.auth0.authorize({
            responseType: 'token id_token',
            redirectUri: AUTH_CONFIG.REDIRECT,
            audience: AUTH_CONFIG.AUDIENCE,
            scope: AUTH_CONFIG.SCOPE
        });
    }

    handleAuth() {
        // When Auth0 hash parsed, get profile
        this.auth0.parseHash((err: any, authResult: any) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                this._getProfile(authResult);
                this.router.navigate(['/']);
            } else if (err) {
                this.router.navigate(['/']);
                console.error(`Error: ${err.error}`);
            }
        });
    }

    private _getProfile(authResult: any) {
        // Use access token to retrieve user's profile and set session
        this.auth0.client.userInfo(authResult.accessToken, (err: any, profile: any) => {
            this._setSession(authResult, profile);
        });
    }

    private _setSession(authResult: any, profile: any) {
        // Save session data and update login status subject
        localStorage.setItem('token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('profile', JSON.stringify(profile));
        this.setLoggedIn(true);
    }

    logout() {
        // Remove tokens and profile and update login status subject
        localStorage.removeItem('token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('profile');
        this.router.navigate(['/']);
        this.setLoggedIn(false);
    }

    get authenticated() {
        // Check if there's an unexpired access token
        return tokenNotExpired('token');
    }

}
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(
        private router: Router,
        private apiService: ApiService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        try {
            // First check if we have a token and it's valid
            const hasValidToken = this.apiService.isAuthenticated();
            
            if (hasValidToken) {
                // User is already authenticated, redirect to dashboard
                this.router.navigate(['/dashboard']);
                return false;
            }

            // Check authentication status more thoroughly
            return this.apiService.initializeAuth().pipe(
                map(isAuthenticated => {
                    if (isAuthenticated) {
                        // User is authenticated, redirect to dashboard
                        this.router.navigate(['/dashboard']);
                        return false;
                    } else {
                        // User is not authenticated, allow access to login page
                        return true;
                    }
                }),
                catchError(error => {
                    console.error('LoginGuard: Error during authentication check:', error);
                    // On error, allow access to login page
                    return of(true);
                })
            );
        } catch (error) {
            console.error('LoginGuard: Error during authentication check:', error);
            // On error, allow access to login page
            return true;
        }
    }
}

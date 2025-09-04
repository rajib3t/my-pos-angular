import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private apiService: ApiService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        console.log('AuthGuard: Checking authentication...');
        
        try {
            // First check if we have a token and it's valid
            const hasValidToken = this.apiService.isAuthenticated();
            
            if (hasValidToken) {
                console.log('AuthGuard: User has valid token, allowing access');
                return true;
            }

            // If no valid token, try to initialize auth (refresh if possible)
            console.log('AuthGuard: No valid token, attempting to refresh...');
            return this.apiService.initializeAuth().pipe(
                map(isAuthenticated => {
                    if (isAuthenticated) {
                        console.log('AuthGuard: Authentication successful after refresh');
                        return true;
                    } else {
                        console.log('AuthGuard: Authentication failed, redirecting to login');
                        this.router.navigate(['/login']);
                        return false;
                    }
                }),
                catchError(error => {
                    console.error('AuthGuard: Error during authentication initialization:', error);
                    this.router.navigate(['/login']);
                    return of(false);
                })
            );
        } catch (error) {
            console.error('AuthGuard: Error during authentication check:', error);
            this.router.navigate(['/login']);
            return false;
        }
    }
}

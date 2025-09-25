import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiService } from './services/api.service';
import { SubdomainValidationService } from './services/subdomain-validation.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(
        private router: Router,
        private apiService: ApiService,
        private subdomainValidationService: SubdomainValidationService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        try {
            // First validate subdomain if it's a subdomain
            const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
            
            if (subdomainInfo.isSubdomain) {
                // If it's a subdomain, validate it first
                return this.subdomainValidationService.validateCurrentSubdomain().pipe(
                    switchMap(subdomainResult => {
                        if (!subdomainResult.isValid) {
                            // Subdomain is invalid, redirect to error page
                            this.router.navigate(['/subdomain-error']);
                            return of(false);
                        }
                        
                        // Subdomain is valid, proceed with authentication check
                        return this.checkAuthentication();
                    }),
                    catchError(error => {
                        console.error('LoginGuard: Error during subdomain validation:', error);
                        // On subdomain validation error, redirect to error page
                        this.router.navigate(['/subdomain-error']);
                        return of(false);
                    })
                );
            } else {
                // Not a subdomain, proceed with normal authentication check
                return this.checkAuthentication();
            }
        } catch (error) {
            console.error('LoginGuard: Error during guard check:', error);
            // On error, allow access to login page
            return true;
        }
    }

    private checkAuthentication(): Observable<boolean> {
        // First check if we have a token and it's valid
        const hasValidToken = this.apiService.isAuthenticated();
        
        if (hasValidToken) {
            // User is already authenticated, redirect to dashboard
            this.router.navigate(['/dashboard']);
            return of(false);
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
    }
}

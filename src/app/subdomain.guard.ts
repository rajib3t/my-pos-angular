import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './services/api.service';
import { UiService } from './services/ui.service';
import { SubdomainValidationService } from './services/subdomain-validation.service';

@Injectable({
    providedIn: 'root'
})
export class SubdomainGuard implements CanActivate {
    constructor(
        private router: Router,
        private uiService: UiService,
        private subdomainValidationService: SubdomainValidationService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        try {
            // Check if current domain is a subdomain and validate it
            const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
            
            if (subdomainInfo.isSubdomain) {
                // It's a subdomain, now validate if the account exists and is active
                return this.subdomainValidationService.validateCurrentSubdomain().pipe(
                    map(result => {
                        if (result.isValid) {
                            // Subdomain is valid, allow access
                            return true;
                        } else {
                            // Subdomain is invalid, redirect to error page
                            console.warn('SubdomainGuard: Access denied - invalid subdomain account');
                            this.router.navigate(['/subdomain-error']);
                            return false;
                        }
                    }),
                    catchError(error => {
                        console.error('SubdomainGuard: Error during subdomain validation:', error);
                        this.router.navigate(['/subdomain-error']);
                        return of(false);
                    })
                );
            } else {
                // Not a subdomain, deny access to subdomain-only routes
                console.warn('SubdomainGuard: Access denied - not a subdomain');
                this.router.navigate(['/login']);
                return false;
            }
        } catch (error) {
            console.error('SubdomainGuard: Error during subdomain check:', error);
            this.router.navigate(['/login']);
            return false;
        }
    }
}

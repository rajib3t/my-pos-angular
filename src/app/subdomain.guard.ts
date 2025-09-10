import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApiService } from './services/api.service';
import { UiService } from './services/ui.service';

@Injectable({
    providedIn: 'root'
})
export class SubdomainGuard implements CanActivate {
    constructor(
        private router: Router,
        private uiService: UiService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        try {
            // Check if current domain is a subdomain
            const isSubdomain = this.uiService.getSubDomain()
            
            if (isSubdomain) {
                // Allow access if it's a subdomain
                return true;
            } else {
                // Redirect to main domain or show error if not a subdomain
                console.warn('SubdomainGuard: Access denied - not a subdomain');
                // You can redirect to a specific route or show an error page
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

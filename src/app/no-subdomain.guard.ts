import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UiService } from './services/ui.service';

@Injectable({
    providedIn: 'root'
})
export class NoSubdomainGuard implements CanActivate {
    constructor(
        private router: Router,
        private uiService: UiService
    ) {}

    canActivate(): boolean | Observable<boolean> {
        try {
            // Check if current domain is a subdomain
            const isSubdomain = this.uiService.getSubDomain();
            
            if (!isSubdomain) {
                // Allow access if it's NOT a subdomain (main domain)
                return true;
            } else {
                // Block access if it's a subdomain
                console.warn('NoSubdomainGuard: Access denied - subdomain access not allowed');
                // You can redirect to a specific route or show an error page
                this.router.navigate(['/login']);
                return false;
            }
        } catch (error) {
            console.error('NoSubdomainGuard: Error during subdomain check:', error);
            // On error, deny access for security
            this.router.navigate(['/login']);
            return false;
        }
    }
}
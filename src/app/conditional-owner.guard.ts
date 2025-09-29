import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UiService } from './services/ui.service';
import { SubdomainValidationService } from './services/subdomain-validation.service';
import { OwnerGuard } from './owner.guard';

@Injectable({
    providedIn: 'root'
})
export class ConditionalOwnerGuard implements CanActivate {
    constructor(
        private router: Router,
        private uiService: UiService,
        private subdomainValidationService: SubdomainValidationService,
        private ownerGuard: OwnerGuard
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
        try {
            // Check if current domain is a subdomain
            const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
            
            if (subdomainInfo.isSubdomain) {
                // It's a subdomain - apply OwnerGuard
                console.log('ConditionalOwnerGuard: Subdomain detected, applying OwnerGuard');
                return this.ownerGuard.canActivate(route, state);
            } else {
                // It's main domain - allow access without OwnerGuard
                console.log('ConditionalOwnerGuard: Main domain detected, allowing access without role restriction');
                return true;
            }
        } catch (error) {
            console.error('ConditionalOwnerGuard: Error during domain check:', error);
            // On error, deny access for security
            this.router.navigate(['/login']);
            return false;
        }
    }
}

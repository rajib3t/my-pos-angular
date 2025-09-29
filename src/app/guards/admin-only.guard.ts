import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleBaseGuard } from './role-base.guard';

@Injectable({
  providedIn: 'root'
})
export class AdminOnlyGuard extends RoleBaseGuard {

  constructor(router: Router) {
    super(router);
  }

  get requiredRoles(): string[] {
    return ['owner']; // Only owners for admin functions
  }

  get guardName(): string {
    return 'AdminOnlyGuard';
  }

  protected override handleAccessDenied(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    // For admin routes, show a more specific error
    console.error('Administrative access required. Contact your system administrator.');
    this.router.navigate(['/dashboard']);
    
    // You could also redirect to a specific "access denied" page
    // this.router.navigate(['/access-denied']);
  }
}

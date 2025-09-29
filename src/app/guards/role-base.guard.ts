import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { appState } from '../state/app.state';

@Injectable({
  providedIn: 'root'
})
export abstract class RoleBaseGuard implements CanActivate {

  constructor(protected router: Router) {}

  abstract get requiredRoles(): string[];
  abstract get guardName(): string;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = appState.user;
    
    // Check if user is authenticated
    if (!user) {
      console.warn(`${this.guardName}: User not authenticated`);
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Check if user has required role
    if (user.role && this.requiredRoles.includes(user.role)) {
      return true;
    }

    // Access denied
    console.warn(`${this.guardName}: Access denied. Required roles: ${this.requiredRoles.join(', ')}, User role: ${user.role || 'none'}`);
    
    // You can customize this behavior:
    // 1. Redirect to dashboard
    // 2. Show error page
    // 3. Show notification
    this.handleAccessDenied(route, state);
    return false;
  }

  protected handleAccessDenied(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    // Default behavior: redirect to dashboard
    this.router.navigate(['/dashboard']);
    
    // You can also show a notification here if you have a notification service
    // this.notificationService.error('Access denied: Insufficient permissions');
  }
}

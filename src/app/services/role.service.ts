import { Injectable } from '@angular/core';
import { appState } from '../state/app.state';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  /**
   * Get current user from appState
   */
  getCurrentUser(): User | null {
    return appState.user;
  }

  /**
   * Get current user role from appState
   */
  getCurrentRole(): string | null {
    return appState.user?.role || null;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    return this.getCurrentRole() === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole ? roles.includes(currentRole) : false;
  }

  /**
   * Check if current user is owner
   */
  isOwner(): boolean {
    return this.hasRole('owner');
  }

  /**
   * Check if current user is manager
   */
  isManager(): boolean {
    return this.hasRole('manager');
  }

  /**
   * Check if current user is manager or above (manager or owner)
   */
  isManagerOrAbove(): boolean {
    return this.hasAnyRole(['manager', 'owner']);
  }

  /**
   * Check if current user is staff
   */
  isStaff(): boolean {
    return this.hasRole('staff');
  }

  /**
   * Check if current user has permission level (hierarchical check)
   * owner > manager > staff
   */
  hasPermissionLevel(requiredLevel: 'owner' | 'manager' | 'staff'): boolean {
    const currentRole = this.getCurrentRole();
    
    if (!currentRole) return false;

    const roleHierarchy = {
      'owner': 3,
      'manager': 2,
      'staff': 1
    };

    const currentLevel = roleHierarchy[currentRole as keyof typeof roleHierarchy] || 0;
    const requiredLevelValue = roleHierarchy[requiredLevel];

    return currentLevel >= requiredLevelValue;
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role?: string): string {
    const roleNames = {
      'owner': 'Owner',
      'manager': 'Manager',
      'staff': 'Staff Member'
    };

    return roleNames[role as keyof typeof roleNames] || 'Unknown Role';
  }

  /**
   * Get role color class for UI
   */
  getRoleColorClass(role?: string): string {
    const roleColors = {
      'owner': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'staff': 'bg-green-100 text-green-800'
    };

    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  }
}

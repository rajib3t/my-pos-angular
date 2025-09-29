# Role-Based Guards Documentation

This document explains how to use role-based guards in the Angular POS application to control access based on user roles stored in `appState`.

## Overview

The application uses Angular route guards to control access to different pages and features based on user roles. User data is stored in the global `appState` and accessed by guards to make authorization decisions.

## Available Guards

### 1. OwnerGuard
- **Purpose**: Restricts access to owner-only features
- **Required Role**: `owner`
- **Usage**: For administrative functions, tenant management, system settings

### 2. ManagerGuard  
- **Purpose**: Restricts access to management features
- **Required Roles**: `manager`, `owner` (owners inherit manager permissions)
- **Usage**: For store management, staff management, reporting

### 3. StaffGuard
- **Purpose**: Ensures user has any valid role
- **Required Roles**: `staff`, `manager`, `owner`
- **Usage**: For general authenticated user features

### 4. AdminOnlyGuard
- **Purpose**: Strict owner-only access with enhanced error handling
- **Required Role**: `owner`
- **Usage**: For critical system functions

## Getting User Role from appState

### In Components

```typescript
import { Component } from '@angular/core';
import { appState } from '../state/app.state';
import { RoleService } from '../services/role.service';

@Component({
  // component code
})
export class MyComponent {
  
  constructor(private roleService: RoleService) {}

  // Method 1: Direct access to appState
  getCurrentUser() {
    return appState.user;
  }

  getCurrentRole() {
    return appState.user?.role;
  }

  // Method 2: Using RoleService (recommended)
  isOwner() {
    return this.roleService.isOwner();
  }

  isManager() {
    return this.roleService.isManager();
  }

  hasRole(role: string) {
    return this.roleService.hasRole(role);
  }

  // Method 3: Template usage
  get userRole() {
    return this.roleService.getCurrentRole();
  }
}
```

### In Templates

```html
<!-- Show content based on role -->
<div *ngIf="roleService.isOwner()">
  Owner only content
</div>

<div *ngIf="roleService.isManagerOrAbove()">
  Manager and Owner content
</div>

<div *ngIf="roleService.hasAnyRole(['staff', 'manager', 'owner'])">
  All authenticated users content
</div>

<!-- Display role badge -->
<span [ngClass]="roleService.getRoleColorClass(userRole)">
  {{ roleService.getRoleDisplayName(userRole) }}
</span>
```

## Route Configuration

### Basic Usage

```typescript
import { Routes } from '@angular/router';
import { OwnerGuard } from './owner.guard';
import { ManagerGuard } from './manager.guard';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [OwnerGuard], // Only owners
    data: { title: 'Admin Panel' }
  },
  {
    path: 'stores',
    component: StoreListComponent,
    canActivate: [ManagerGuard], // Managers and owners
    data: { title: 'Store Management' }
  }
];
```

### Multiple Guards

```typescript
{
  path: 'tenants',
  component: TenantListComponent,
  canActivate: [NoSubdomainGuard, OwnerGuard], // Must be on main domain AND be owner
  data: { title: 'Tenant Management' }
}
```

## RoleService Methods

The `RoleService` provides convenient methods for role checking:

### Basic Role Checks
- `getCurrentUser()`: Get current user object
- `getCurrentRole()`: Get current user role string
- `hasRole(role: string)`: Check if user has specific role
- `hasAnyRole(roles: string[])`: Check if user has any of the specified roles

### Convenience Methods
- `isOwner()`: Check if user is owner
- `isManager()`: Check if user is manager
- `isManagerOrAbove()`: Check if user is manager or owner
- `isStaff()`: Check if user is staff

### Hierarchical Checks
- `hasPermissionLevel(level)`: Check permission level (owner > manager > staff)

### UI Helpers
- `getRoleDisplayName(role)`: Get formatted role name for display
- `getRoleColorClass(role)`: Get CSS classes for role badges

## Role Hierarchy

The application follows this role hierarchy:

```
Owner (Level 3)
  ├── Full system access
  ├── Can access all manager functions
  ├── Can manage tenants
  └── Can manage system settings

Manager (Level 2)  
  ├── Can access all staff functions
  ├── Can manage stores
  ├── Can manage staff
  └── Can view reports

Staff (Level 1)
  ├── Basic POS functions
  ├── Can process transactions
  └── Can view assigned data
```

## Error Handling

Guards automatically handle access denial by:

1. **Logging**: Console warnings with guard name and required roles
2. **Redirection**: Automatic redirect to dashboard or login
3. **Query Parameters**: Preserves return URL for post-login redirect

### Custom Error Handling

You can extend the base guard for custom behavior:

```typescript
import { RoleBaseGuard } from './guards/role-base.guard';

@Injectable()
export class CustomGuard extends RoleBaseGuard {
  
  protected handleAccessDenied(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    // Custom logic - show notification, redirect to specific page, etc.
    this.notificationService.error('Access denied: Insufficient permissions');
    this.router.navigate(['/access-denied']);
  }
}
```

## Best Practices

### 1. Use RoleService in Components
```typescript
// ✅ Good - Use service
constructor(private roleService: RoleService) {}

// ❌ Avoid - Direct appState access in templates
{{ appState.user?.role }}
```

### 2. Combine Guards When Needed
```typescript
// ✅ Good - Multiple conditions
canActivate: [AuthGuard, SubdomainGuard, ManagerGuard]
```

### 3. Handle Loading States
```typescript
// ✅ Good - Check for user existence
if (appState.user && appState.user.role === 'owner') {
  // Safe to proceed
}
```

### 4. Provide Fallbacks
```typescript
// ✅ Good - Graceful degradation
<div *ngIf="roleService.isOwner(); else limitedView">
  Full admin interface
</div>
<ng-template #limitedView>
  Limited interface for non-owners
</ng-template>
```

## Testing

### Unit Testing Guards

```typescript
describe('OwnerGuard', () => {
  let guard: OwnerGuard;
  let router: Router;

  beforeEach(() => {
    // Setup test module
  });

  it('should allow access for owner', () => {
    // Mock appState with owner user
    spyOnProperty(appState, 'user', 'get').and.returnValue({
      role: 'owner',
      name: 'Test Owner'
    });

    expect(guard.canActivate()).toBe(true);
  });

  it('should deny access for non-owner', () => {
    // Mock appState with staff user
    spyOnProperty(appState, 'user', 'get').and.returnValue({
      role: 'staff',
      name: 'Test Staff'
    });

    expect(guard.canActivate()).toBe(false);
  });
});
```

## Migration Guide

If you have existing guards, migrate them to use the new role-based system:

### Before
```typescript
// Old guard checking localStorage directly
const userData = JSON.parse(localStorage.getItem('user') || '{}');
if (userData.role === 'owner') {
  return true;
}
```

### After
```typescript
// New guard using appState
const user = appState.user;
if (user && user.role === 'owner') {
  return true;
}
```

## Troubleshooting

### Common Issues

1. **Guard not working**: Ensure guard is imported in routes
2. **Role not found**: Check if user data is properly set in appState
3. **Infinite redirects**: Verify guard logic doesn't create redirect loops
4. **State not persisting**: Ensure appState persistence is working

### Debug Commands

```typescript
// Check current user state
console.log('Current user:', appState.user);
console.log('Current role:', appState.user?.role);

// Check if guards are working
console.log('Is owner:', roleService.isOwner());
console.log('Is manager:', roleService.isManager());
```

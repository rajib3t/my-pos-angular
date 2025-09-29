import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { appState } from '../state/app.state';
import { User } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-role-access-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4">Role Access Example</h2>
      
      <!-- Current User Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Current User</h3>
        <div *ngIf="currentUser; else noUser">
          <p><strong>Name:</strong> {{ currentUser.name }}</p>
          <p><strong>Email:</strong> {{ currentUser.email }}</p>
          <p><strong>Role:</strong> 
            <span class="px-2 py-1 rounded text-sm" 
                  [ngClass]="getRoleClass(currentUser.role)">
              {{ currentUser.role || 'No Role' }}
            </span>
          </p>
        </div>
        <ng-template #noUser>
          <p class="text-gray-500">No user logged in</p>
        </ng-template>
      </div>

      <!-- Role-based Content -->
      <div class="space-y-4">
        <!-- Owner Only Content -->
        <div *ngIf="isOwner" class="p-4 bg-purple-50 border border-purple-200 rounded">
          <h4 class="font-semibold text-purple-800">🔑 Owner Only Content</h4>
          <p class="text-purple-700">This content is only visible to owners.</p>
          <button class="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Owner Action
          </button>
        </div>

        <!-- Manager+ Content (Manager and Owner) -->
        <div *ngIf="isManagerOrAbove" class="p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 class="font-semibold text-blue-800">👔 Manager+ Content</h4>
          <p class="text-blue-700">This content is visible to managers and owners.</p>
          <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Manager Action
          </button>
        </div>

        <!-- Staff Content (All authenticated users) -->
        <div *ngIf="currentUser" class="p-4 bg-green-50 border border-green-200 rounded">
          <h4 class="font-semibold text-green-800">👤 Staff Content</h4>
          <p class="text-green-700">This content is visible to all authenticated users.</p>
          <button class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Staff Action
          </button>
        </div>

        <!-- No Access -->
        <div *ngIf="!currentUser" class="p-4 bg-red-50 border border-red-200 rounded">
          <h4 class="font-semibold text-red-800">🚫 No Access</h4>
          <p class="text-red-700">Please log in to access content.</p>
        </div>
      </div>

      <!-- Role Check Methods Demo -->
      <div class="mt-6 p-4 bg-yellow-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Role Check Methods</h3>
        <div class="space-y-2 text-sm">
          <p><strong>isOwner:</strong> {{ isOwner }}</p>
          <p><strong>isManager:</strong> {{ isManager }}</p>
          <p><strong>isManagerOrAbove:</strong> {{ isManagerOrAbove }}</p>
          <p><strong>hasRole('owner'):</strong> {{ hasRole('owner') }}</p>
          <p><strong>hasRole('manager'):</strong> {{ hasRole('manager') }}</p>
          <p><strong>hasAnyRole(['owner', 'manager']):</strong> {{ hasAnyRole(['owner', 'manager']) }}</p>
        </div>
      </div>
    </div>
  `
})
export class RoleAccessExampleComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private subscription?: Subscription;

  ngOnInit() {
    // Get initial user state
    this.currentUser = appState.user;
    
    // Subscribe to user changes (if you need reactive updates)
    // Note: appState is signal-based, so you could also use effect() or computed()
    this.checkUserChanges();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private checkUserChanges() {
    // Since appState uses signals, we can watch for changes
    // This is a simple polling approach - in a real app you might use effects
    setInterval(() => {
      const newUser = appState.user;
      if (newUser !== this.currentUser) {
        this.currentUser = newUser;
      }
    }, 1000);
  }

  // Role checking computed properties
  get isOwner(): boolean {
    return this.currentUser?.role === 'owner';
  }

  get isManager(): boolean {
    return this.currentUser?.role === 'manager';
  }

  get isManagerOrAbove(): boolean {
    return this.currentUser?.role === 'manager' || this.currentUser?.role === 'owner';
  }

  // Role checking methods
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBaseGuard } from './role-base.guard';

@Injectable({
  providedIn: 'root'
})
export class StaffGuard extends RoleBaseGuard {

  constructor(router: Router) {
    super(router);
  }

  get requiredRoles(): string[] {
    return ['staff', 'manager', 'owner']; // All authenticated users with roles
  }

  get guardName(): string {
    return 'StaffGuard';
  }
}

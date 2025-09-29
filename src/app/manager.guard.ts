import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBaseGuard } from './guards/role-base.guard';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard extends RoleBaseGuard {

  constructor(router: Router) {
    super(router);
  }

  get requiredRoles(): string[] {
    return ['manager', 'owner']; // Owners can access manager routes
  }

  get guardName(): string {
    return 'ManagerGuard';
  }
}

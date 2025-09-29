import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RoleBaseGuard } from './guards/role-base.guard';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard extends RoleBaseGuard {

  constructor(router: Router) {
    super(router);
  }

  get requiredRoles(): string[] {
    return ['owner'];
  }

  get guardName(): string {
    return 'OwnerGuard';
  }
}

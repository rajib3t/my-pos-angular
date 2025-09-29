import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, forkJoin, Subject, BehaviorSubject } from "rxjs";
import { PaginatedResponse } from './api-response.model';
import { map, tap } from 'rxjs/operators';
import { User } from './user.service';


// Enhanced StoreUser interface
export interface StoreUser extends User {
  _id: string;
}

// Base staff member interface
export interface StaffMember {
  _id: string;
  store: string;
  user: StoreUser;
  createdAt: string;
  invitedBy: string;
  joinedAt: string;
  permissions: string[];
  role: StaffRole;
  status: StaffStatus;
  updatedAt: string;
}

// Strict typing for staff members (recommended for components)
export interface StaffMemberStrict {
  _id: string;
  store: string;
  user: StoreUser;
  createdAt: Date | string;
  invitedBy: string;
  joinedAt: Date | string;
  permissions: Permission[];
  role: StaffRole;
  status: StaffStatus;
  updatedAt: Date | string;
}

// Staff role enum for better type safety
export enum StaffRole {
  STAFF = 'staff',
  MANAGER = 'manager',
  ADMIN = 'admin',
  OWNER = 'owner'
}

// Staff status enum for better type safety
export enum StaffStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Permission interface for granular access control
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// Staff update request interface
export interface StaffUpdateRequest {
  role?: StaffRole;
  status?: StaffStatus;
  permissions?: string[];
}

// Bulk operations interface
export interface BulkStaffOperation {
  userIds: string[];
  action: 'add' | 'remove' | 'update';
  data?: StaffUpdateRequest;
}
export interface Store {
  _id?: string;
  name: string;
  code?: string;
  email?:string;
  mobile?:string;
  status: 'inactive' | 'active';
  createdBy?: string;
}
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Store change notification subjects
  private storeListChangedSubject = new Subject<void>();
  private storeCreatedSubject = new Subject<Store>();
  private storeUpdatedSubject = new Subject<Store>();
  private storeDeletedSubject = new Subject<string>();

  // Public observables for components to subscribe to
  public storeListChanged$ = this.storeListChangedSubject.asObservable();
  public storeCreated$ = this.storeCreatedSubject.asObservable();
  public storeUpdated$ = this.storeUpdatedSubject.asObservable();
  public storeDeleted$ = this.storeDeletedSubject.asObservable();

  constructor(
    private apiService: ApiService
  ) { }

  // Method to manually trigger store list refresh
  public refreshStoreList(): void {
    this.storeListChangedSubject.next();
  }






  getAllStores(page: number = 1, limit: number = 10, filter?: { [key: string]: any }): Observable<PaginatedResponse<Store>> {
    return new Observable<PaginatedResponse<Store>>((observer) => {
       let queryParams = `page=${page}&limit=${limit}&timezone=-330`;
      if (filter) {
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
            queryParams += `&${key}=${encodeURIComponent(filter[key])}`;
          }
        });
      }
       const url = `tenants/stores?${queryParams}`;
      this.apiService.protectedGet<{ data: PaginatedResponse<Store> }>(url).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }


  create(data : Partial<Store>) : Observable<Partial<Store>>{
    return new Observable<Partial<Store>>((observer) => {
      this.apiService.protectedPost<{ data: Partial<Store> }>(`tenants/stores`,data).subscribe({
        next: (response) => {
          const createdStore = response.data.data;
          observer.next(createdStore);
          observer.complete();
          
          // Notify that a new store was created
          this.storeCreatedSubject.next(createdStore as Store);
          this.storeListChangedSubject.next();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    })

  }

  getById(storeId: string): Observable<Store> {
    return new Observable<Store>((observer) => {
      this.apiService.protectedGet<{ data: Store }>(`tenants/stores/${storeId}`).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  update(storeId: string, data: Partial<Store>): Observable<Store> {
    return new Observable<Store>((observer) => {
      this.apiService.protectedPut<{ data: Store }>(`tenants/stores/${storeId}`, data).subscribe({
        next: (response) => {
          const updatedStore = response.data.data;
          observer.next(updatedStore);
          observer.complete();
          
          // Notify that a store was updated
          this.storeUpdatedSubject.next(updatedStore);
          this.storeListChangedSubject.next();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  delete(storeId: string): Observable<{ message: string }> {
    return new Observable<{ message: string }>((observer) => {
      const url = `tenants/stores/${storeId}`;
      this.apiService.protectedDelete<{ message: string }>(url).subscribe({
        next: (response) => {
          observer.next({ message: response.data.message });
          observer.complete();
          
          // Notify that a store was deleted
          this.storeDeletedSubject.next(storeId);
          this.storeListChangedSubject.next();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getStaffs(storeId : string , page: number = 1, limit: number = 10, filter?: { [key: string]: any }) : Observable<PaginatedResponse<StaffMemberStrict>> {
    return new Observable<PaginatedResponse<StaffMemberStrict>>  ((observer)=>{
      let queryParams = `page=${page}&limit=${limit}&timezone=-330`;
      if (filter) {
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
            queryParams += `&${key}=${encodeURIComponent(filter[key])}`;
          }
        });
      }
       const url = `tenants/stores/${storeId}/staffs?${queryParams}`;
      this.apiService.protectedGet<any>(url).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    })
  } 


  getStoreCandidates(storeId: string, page: number = 1, limit: number = 10, filter?: { [key: string]: any }) : Observable<any>{
    return new Observable<any>((observer)=>{
        let queryParams = `page=${page}&limit=${limit}&timezone=-330`;
        if (filter) {
          Object.keys(filter).forEach(key => {
            if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
              queryParams += `&${key}=${encodeURIComponent(filter[key])}`;
            }
          });
        }
        const url = `tenants/stores/${storeId}/staffs/candidates?${queryParams}`;
        this.apiService.protectedGet<any>(url).subscribe({
          next: (response) => {
            observer.next(response.data.data);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
    }) 
  }

  addStaff(storeId: string, userId: string, role?: string, status?: boolean, permissions?: string[]): Observable<any> {
    return new Observable<any>((observer) => {
      const data = {
        userId,
        ...(role && { role }),
        ...(status !== undefined && { status }),
        ...(permissions && { permissions })
      };
      
      const url = `tenants/stores/${storeId}/staffs`;
      this.apiService.protectedPost<any>(url, data).subscribe({
        next: (response) => {
          observer.next(response.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  addMultipleStaff(storeId: string, userIds: string[], role?: string, status?: boolean, permissions?: string[]): Observable<any> {
    return new Observable<any>((observer) => {
      const requests = userIds.map(userId => 
        this.addStaff(storeId, userId, role, status, permissions)
      );
      
      // Use forkJoin to handle multiple parallel requests
      forkJoin(requests).subscribe({
        next: (responses) => {
          observer.next(responses);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  removeStaff(storeId: string, userId: string): Observable<any> {
    return new Observable<any>((observer) => {
      const data = { userId };
      const url = `tenants/stores/${storeId}/staffs`;
      
      this.apiService.protectedDelete<any>(url, data).subscribe({
        next: (response) => {
          observer.next(response.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  removeMultipleStaff(storeId: string, userIds: string[]): Observable<any> {
    return new Observable<any>((observer) => {
      const requests = userIds.map(userId => 
        this.removeStaff(storeId, userId)
      );
      
      // Use forkJoin to handle multiple parallel requests
      forkJoin(requests).subscribe({
        next: (responses) => {
          observer.next(responses);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateStaff(storeId: string, userId: string, updateData: StaffUpdateRequest): Observable<any> {
    return new Observable<any>((observer) => {
      const data = { userId, ...updateData };
      const url = `tenants/stores/${storeId}/staffs`;
      
      this.apiService.protectedPut<any>(url, data).subscribe({
        next: (response) => {
          observer.next(response.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateStaffStatus(storeId: string, userId: string, status: StaffStatus): Observable<any> {
    return this.updateStaff(storeId, userId, { status });
  }

  updateStaffRole(storeId: string, userId: string, role: StaffRole): Observable<any> {
    return this.updateStaff(storeId, userId, { role });
  }
}

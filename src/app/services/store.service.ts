import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, forkJoin } from "rxjs";
import { PaginatedResponse } from './api-response.model';
import { map } from 'rxjs/operators';
import { User } from './user.service';




interface StaffMember {
  _id: string;
  store: string;
  user: User;
  createdAt: string;
  invitedBy: string;
  joinedAt: string;
  permissions: string[]; // Array of permission strings
  role: "staff" | "manager" | string; // Can be extended with other roles
  status: "pending" | "active" | "inactive" | string; // Can be extended with other statuses
  updatedAt: string;
}

// Optional: More specific interfaces if you want stricter typing
export interface StaffMemberStrict {
  _id: string;
  store: string;
  user: User;
  createdAt: string; // Could be Date if you parse it
  invitedBy: string;
  joinedAt: string; // Could be Date if you parse it
  permissions: Permission[]; // If you have a Permission interface
  role: StaffRole;
  status: StaffStatus;
  updatedAt: string; // Could be Date if you parse it
}

// Supporting enums/types for stricter typing
type StaffRole = "staff" | "manager" | "admin";
type StaffStatus = "pending" | "active" | "inactive" | "suspended";

// If you have a permissions system
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
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
  constructor(
    private apiService: ApiService
  ) { }






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
          observer.next(response.data.data);
          observer.complete();
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
          observer.next(response.data.data);
          observer.complete();
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
}

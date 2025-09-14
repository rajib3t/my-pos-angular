import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import { Observable } from 'rxjs';

export interface PaginatedResult {
  items: Tenant[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Tenant {
  _id?: string;
  id?: string;
  name: string;
  subdomain?: string;
  databaseName?: string;
  databaseUser?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface TenantSettingResponse {
  id?: string;
  name: string;
  shopName?: string;
  code?: string
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  currency?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  fassi?: string;
  gstNumber?: string;
  sgst?: number;
  cgst?: number;
}
@Injectable({
  providedIn: 'root'
})


export class TenantService {

  constructor(
    private apiService: ApiService,
   
  ) { }


  createTenant(tenant: Tenant): Observable<Tenant> {
    return new Observable<Tenant>((observer) => {
      this.apiService.protectedPost<{ data: Tenant }>('tenant/create', tenant).subscribe({
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

  getTenantSetting(subdomain: string): Observable<TenantSettingResponse> {

    return new Observable<TenantSettingResponse>((observer) => {
      this.apiService.protectedGet<{ data: TenantSettingResponse }>(`tenants/settings/${subdomain}`).subscribe({
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


  updateTenantSetting(subdomain: string, settings: TenantSettingResponse): Observable<TenantSettingResponse> {

    return new Observable<TenantSettingResponse>((observer) => {
      this.apiService.protectedPut<{ data: TenantSettingResponse }>(`tenants/settings/${subdomain}`, settings).subscribe({
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



  getAllTenants(page: number = 1, limit: number = 10, filter?: { [key: string]: any }): Observable<PaginatedResult> {
    return new Observable<PaginatedResult>((observer) => {
      // Build query parameters
      let queryParams = `page=${page}&limit=${limit}&timezone=-330`;
      if (filter) {
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
            queryParams += `&${key}=${encodeURIComponent(filter[key])}`;
          }
        });
      }

      this.apiService.protectedGet<{data: PaginatedResult}>(`tenant?${queryParams}`).subscribe({
        next: (response) => {
          // The API returns pagination structure in response.data
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateTenant (id: string, tenant: Partial<Tenant>): Observable<Partial<Tenant>> {
    return new Observable<Partial<Tenant>>((observer) => {
      this.apiService.protectedPut<{ data: Partial<Tenant> }>(`tenant/${id}`, tenant).subscribe({
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

  getTenantById(id: string): Observable<Tenant> {
    return new Observable<Tenant>((observer) => {
      this.apiService.protectedGet<{ data: Tenant }>(`tenant/${id}`).subscribe({
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

  deleteTenant(id: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.apiService.protectedDelete<{ data: any }>(`tenant/${id}`).subscribe({
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
  


}


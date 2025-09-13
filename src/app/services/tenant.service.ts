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
  id?: string;
  name: string;
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
      this.apiService.protectedGet<{ data: PaginatedResult }>(`tenant?page=${page}&limit=${limit}`, filter).subscribe({
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

  


}


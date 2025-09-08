import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import { Observable } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

@Injectable({
  providedIn: 'root'
})


export class TenantService {

  constructor(private apiService: ApiService) { }


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


}


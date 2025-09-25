import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from "rxjs";
import { PaginatedResponse } from './api-response.model';
import { map } from 'rxjs/operators';

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
}

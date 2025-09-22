import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from "rxjs";
import { PaginatedResponse } from './api-response.model';

export interface Store {
  _id?: string;
  name: string;
  code?: string;
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
      this.apiService.protectedGet<{ data: PaginatedResponse<Store> }>(`stores?page=${page}&limit=${limit}&timezone=-330`).subscribe({
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

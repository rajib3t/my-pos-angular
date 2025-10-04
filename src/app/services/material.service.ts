import { Injectable , OnDestroy} from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { User } from './user.service';
import { ApiService } from './api.service';
import { map, tap, catchError } from 'rxjs/operators';
import { PaginatedResponse } from './api-response.model';
import { FormService, QueryFilter } from './form.service';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface IMaterialCategory {
  _id:string
  name:string
  code:string
  createdBy : Partial<User>
}

export interface CreateMaterialCategoryDto {
  name: string;
  code?: string;
}

export interface UpdateMaterialCategoryDto {
  name?: string;
  code?: string;
}
@Injectable({
  providedIn: 'root'
})
export class MaterialService implements OnDestroy {
  
  private readonly materialCategoryListChangedSubject = new Subject<void>();
  private readonly materialCategoryCreatedSubject = new Subject<IMaterialCategory>();
  private readonly materialCategoryUpdatedSubject = new Subject<IMaterialCategory>();
  private readonly materialCategoryDeletedSubject = new Subject<string>();

  public readonly materialCategoryListChanged$ = this.materialCategoryListChangedSubject.asObservable();
  public readonly materialCategoryCreated$ = this.materialCategoryCreatedSubject.asObservable();
  public readonly materialCategoryUpdated$ = this.materialCategoryUpdatedSubject.asObservable();
  public readonly materialCategoryDeleted$ = this.materialCategoryDeletedSubject.asObservable();

 
  constructor(
    private apiService : ApiService,
    private formService : FormService
  ){

  }

  ngOnDestroy(): void {
    this.materialCategoryListChangedSubject.complete();
    this.materialCategoryCreatedSubject.complete();
    this.materialCategoryUpdatedSubject.complete();
    this.materialCategoryDeletedSubject.complete();
  }

  /**
   * Manually trigger  list refresh notification
   */
  public refreshStoreList(): void {
    this.materialCategoryListChangedSubject.next();
  }

 /**
   * Create a new material category
   * @param storeID Store identifier
   * @param data Material category data
   * @returns Observable of created material category
   */
  create(storeID: string, data: CreateMaterialCategoryDto): Observable<IMaterialCategory> {
    if (!storeID?.trim()) {
      return throwError(() => new Error('Store ID is required'));
    }

    if (!data.name?.trim()) {
      return throwError(() => new Error('Material category name is required'));
    }

    return this.apiService
      .protectedPost<{ data: IMaterialCategory }>(
        `tenants/stores/${storeID}/material-category`, 
        data
      )
      .pipe(
        map(response => response.data.data),
        tap(materialCategory => {
          this.materialCategoryCreatedSubject.next(materialCategory);
          this.materialCategoryListChangedSubject.next();
        }),
        catchError(this.handleError('create'))
      );
  }

  /**
   * Get all material categories with pagination and filtering for a specific store
   * @param storeID Store identifier
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @param filter Optional filter criteria
   * @returns Observable of paginated material categories
   */
  getAll(
    storeID: string, 
    page: number = 1,
    limit: number = 10,
    filter?: QueryFilter
  ): Observable<PaginatedResponse<IMaterialCategory>> {
    if (!storeID?.trim()) {
      return throwError(() => new Error('Store ID is required'));
    }

    

    const queryParams = this.formService.buildQueryParams(page, limit, filter);
    
    return this.apiService
      .protectedGet<{ data: PaginatedResponse<IMaterialCategory> }>(
        `tenants/stores/${storeID}/material-category?populate=true&${queryParams}`
      )
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError('getAll'))
      );
  }

  /**
   * Update an existing material category
   * @param storeID Store identifier
   * @param categoryID Category identifier
   * @param data Updated category data
   * @returns Observable of updated material category
   */
  update(
    storeID: string, 
    categoryID: string, 
    data: UpdateMaterialCategoryDto
  ): Observable<IMaterialCategory> {
    if (!storeID?.trim() || !categoryID?.trim()) {
      return throwError(() => new Error('Store ID and Category ID are required'));
    }

    return this.apiService
      .protectedPut<{ data: IMaterialCategory }>(
        `tenants/stores/${storeID}/material-category/${categoryID}`, 
        data
      )
      .pipe(
        map(response => response.data.data),
        tap(materialCategory => {
          this.materialCategoryUpdatedSubject.next(materialCategory);
          this.materialCategoryListChangedSubject.next();
        }),
        catchError(this.handleError('update'))
      );
  }

  /**
   * Delete a material category
   * @param storeID Store identifier
   * @param categoryID Category identifier
   * @returns Observable of deletion result
   */
  delete(storeID: string, categoryID: string): Observable<void> {
    if (!storeID?.trim() || !categoryID?.trim()) {
      return throwError(() => new Error('Store ID and Category ID are required'));
    }

    return this.apiService
      .protectedDelete<{ data: any }>(
        `tenants/stores/${storeID}/material-category/${categoryID}`
      )
      .pipe(
        map(() => void 0),
        tap(() => {
          this.materialCategoryDeletedSubject.next(categoryID);
          this.materialCategoryListChangedSubject.next();
        }),
        catchError(this.handleError('delete'))
      );
  }
  /**
   * Get a single material category by ID
   * @param storeID Store identifier
   * @param categoryID Category identifier
   * @returns Observable of material category
   */
  getById(storeID: string, categoryID: string): Observable<IMaterialCategory> {
    if (!storeID?.trim() || !categoryID?.trim()) {
      return throwError(() => new Error('Store ID and Category ID are required'));
    }

    return this.apiService
      .protectedGet<{ data: IMaterialCategory }>(
        `tenants/stores/${storeID}/material-category/${categoryID}`
      )
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError('getById'))
      );
  }
  /**
   * Centralized error handling
   * @private
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`StoreService.${operation} failed:`, error);
      
      // You can add additional error handling here:
      // - Show user notifications
      // - Log to external service
      // - Transform error messages
      
      return throwError(() => error);
    };
  }


  generateCode(storeID: string, name: string): Observable<{ code: string }> {
    if (!storeID?.trim() || !name?.trim()) {
      return throwError(() => new Error('Store ID and Name are required'));
    }

    return this.apiService
      .protectedPost<{ data: { code: string } }>(
        `tenants/stores/${storeID}/material-category/generate-code`,
        { name }
      )
      .pipe(
        map(response => response.data.data),
        catchError(this.handleError('generateCode'))
      );
    }
  }

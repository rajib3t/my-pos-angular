import { MaterialService, IMaterialCategory } from '@/app/services/material.service';
import { Component, effect, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { PaginatedResponse } from '@/app/services/api-response.model';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { appState } from '@/app/state/app.state';
import { UiService } from '@/app/services/ui.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-material-category',
  imports: [PaginationComponent],
  templateUrl: './material-category.html',
  styleUrl: './material-category.css'
})
export class MaterialCategory implements OnInit {
  // Signals for reactive state
  protected readonly loading = signal(false);
  protected readonly categories = signal<IMaterialCategory[]>([]);
  protected readonly paginationConfig = signal<PaginationConfig>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  private storeID: string | null = null;
  private filter: Record<string, any> = {};
  private sortField = '';
  private sortDirection: 'asc' | 'desc' = 'asc';

  private readonly destroyRef = inject(DestroyRef);
  private readonly materialService = inject(MaterialService);
  private readonly uiService = inject(UiService);

  constructor() {
    this.setupStoreEffect();
  }

  ngOnInit(): void {
    if (this.storeID) {
      this.loadCategories();
    }
  }

  private setupStoreEffect(): void {
    effect(() => {
      const store = appState.store;
      const newStoreID = store?._id ?? null;

      if (newStoreID && newStoreID !== this.storeID) {
        this.storeID = newStoreID;
        this.loadCategories();
      }
    }, { 
      allowSignalWrites: true 
    });
  }

  protected onPaginationChange(change: PaginationChange): void {
    this.paginationConfig.update(config => ({
      ...config,
      page: change.page,
      limit: change.limit
    }));
    this.loadCategories();
  }

  protected onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadCategories();
  }

  protected applyFilter(newFilter: Record<string, any>): void {
    this.filter = { ...newFilter };
    this.paginationConfig.update(config => ({ ...config, page: 1 }));
    this.loadCategories();
  }

  private loadCategories(): void {
    if (!this.storeID) {
      console.warn('Cannot load categories: storeID is null');
      return;
    }

    this.loading.set(true);

    const queryFilter = this.buildQueryFilter();
    const config = this.paginationConfig();

    this.materialService
      .getAll(this.storeID, config.page, config.limit, queryFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: PaginatedResponse<IMaterialCategory>) => {
          this.categories.set(result.items);
          this.paginationConfig.set({
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: Math.ceil(result.total / result.limit)
          });
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load categories:', error);
          this.uiService.error('Failed to load categories. Please try again.', 'Error');
          this.loading.set(false);
        }
      });
  }

  private buildQueryFilter(): Record<string, any> {
    const queryFilter = { ...this.filter };
    
    if (this.sortField) {
      queryFilter['sortField'] = this.sortField;
      queryFilter['sortDirection'] = this.sortDirection;
    }

    return queryFilter;
  }

  protected refresh(): void {
    this.loadCategories();
  }
}
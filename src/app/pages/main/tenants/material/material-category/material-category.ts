import { MaterialService, IMaterialCategory } from '@/app/services/material.service';
import { Component, effect, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { PaginatedResponse } from '@/app/services/api-response.model';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { appState } from '@/app/state/app.state';
import { UiService } from '@/app/services/ui.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideAngularModule, Album as DashboardIcon, Tag as CategoryIcon, Plus as PlusIcon, Edit as EditIcon, Trash2 as DeleteIcon } from 'lucide-angular';
import { FormGroup, ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-material-category',
  imports: [PaginationComponent, LucideAngularModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './material-category.html',
  styleUrl: './material-category.css'
})
export class MaterialCategory implements OnInit {
  readonly DashboardIcon = DashboardIcon;
  readonly CategoryIcon = CategoryIcon;
  readonly PlusIcon = PlusIcon;
  readonly EditIcon = EditIcon;
  readonly DeleteIcon = DeleteIcon;

  // Signals for reactive state
  protected readonly loading = signal(false);
  protected readonly categories = signal<IMaterialCategory[]>([]);
  protected readonly paginationConfig = signal<PaginationConfig>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  // Search and filter properties
  showSearchFilters: boolean = false;
  searchForm!: FormGroup;
  filter: Record<string, any> = {};
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Delete popup properties
  showDeletePopup: boolean = false;
  categoryToDelete: IMaterialCategory | null = null;
  confirmationName: string = '';
  isDeleting: boolean = false;

  private storeID: string | null = null;
  private readonly fb = inject(FormBuilder);

  private readonly destroyRef = inject(DestroyRef);
  private readonly materialService = inject(MaterialService);
  private readonly uiService = inject(UiService);
  protected readonly router = inject(Router);
  
  constructor() {
    this.initializeSearchForm();
    this.setupStoreEffect();
  }

  ngOnInit(): void {
    if (this.storeID) {
      this.loadCategories();
    }
    this.setupSearchSubscription();
  }

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      code: ['']
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(values => {
        this.filter = { ...values };
        // Remove empty values
        Object.keys(this.filter).forEach(key => {
          if (!this.filter[key]) {
            delete this.filter[key];
          }
        });
        
        // Reset to first page and reload
        this.paginationConfig.update(config => ({ ...config, page: 1 }));
        this.loadCategories();
      });
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

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.update(config => ({ ...config, page: 1 }));
    this.loadCategories();
  }

  goToDashboard(): void {
    this.router.navigate(['dashboard']);
  }

  gotoAddCategory(): void {
    this.router.navigate(['/material-category-create']);
  }

  onEditCategory(category: IMaterialCategory): void {
    this.router.navigate([`material-category-edit/${category._id}`]);
  }

  onDeleteCategory(category: IMaterialCategory): void {
    this.categoryToDelete = category;
    this.confirmationName = '';
    this.showDeletePopup = true;
    this.isDeleting = false;
  }

  confirmDeleteCategory(): void {
    if (!this.categoryToDelete || !this.storeID || this.confirmationName.trim() !== (this.categoryToDelete.name || '') || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    const categoryId = this.categoryToDelete._id;
    const categoryName = this.categoryToDelete.name;

    this.materialService.delete(this.storeID, categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Remove locally
          this.categories.update(cats => cats.filter(c => c._id !== categoryId));
          
          // Update pagination
          const currentCategories = this.categories();
          if (currentCategories.length === 0 && this.paginationConfig().page > 1) {
            this.paginationConfig.update(config => ({ ...config, page: config.page - 1 }));
            this.loadCategories();
          } else {
            this.paginationConfig.update(config => ({
              ...config,
              total: config.total - 1,
              pages: Math.ceil((config.total - 1) / config.limit)
            }));
          }

          this.closeDeletePopup();
          this.isDeleting = false;
          this.uiService.success(`Category "${categoryName}" has been successfully deleted.`, 'Success');
        },
        error: () => {
          this.uiService.error(`Failed to delete category "${categoryName}". Please try again.`, 'Error');
          this.isDeleting = false;
        }
      });
  }

  closeDeletePopup(): void {
    if (this.isDeleting) return;
    this.showDeletePopup = false;
    this.categoryToDelete = null;
    this.confirmationName = '';
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.filter).length > 0;
  }

  getNoResultsMessage(): string {
    if (!this.hasActiveFilters()) {
      return 'No material categories found.';
    }

    const parts: string[] = [];
    const mapLabel = (key: string): string => {
      switch (key) {
        case 'name': return 'Name';
        case 'code': return 'Code';
        default: return key;
      }
    };

    Object.keys(this.filter).forEach(key => {
      if (this.filter[key]) {
        parts.push(`${mapLabel(key)}: "${this.filter[key]}"`);
      }
    });

    const filtersDesc = parts.join(', ');
    return filtersDesc
      ? `No categories found for filters — ${filtersDesc}.`
      : 'No material categories found.';
  }

  getCategoryInitials(name: string): string {
    if (!name) return '';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    } else {
      const firstInitial = names[0].charAt(0);
      const lastInitial = names[names.length - 1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }
  }
}
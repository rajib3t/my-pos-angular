import { CommonModule } from '@angular/common';
import { Component , OnInit, DestroyRef, inject} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Store as StoreIcon, Album as DashboardIcon,User as UserIcon } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import {FormGroup, ReactiveFormsModule, FormBuilder, FormsModule} from '@angular/forms'
import { formatTime, formatDate } from '@/app/shared/utils/date-time.utils';
import { StoreService } from '@/app/services/store.service';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { PaginatedResponse } from '@/app/services/api-response.model';
import { Store } from '@/app/services/store.service';
import { UiService } from '@/app/services/ui.service';
import { appState } from '@/app/state/app.state';
@Component({
  selector: 'app-store-list',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PaginationComponent,
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.css'
})
export class StoreList implements OnInit {
  readonly StoreIcon = StoreIcon
  readonly DashboardIcon = DashboardIcon
  readonly UserIcon = UserIcon;

  showSearchFilters: boolean = false;
  searchForm!: FormGroup;
  loading: boolean = false;
  filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  stores : Store[] = []
   paginationConfig: PaginationConfig = {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    };
  // Delete popup properties
  showDeletePopup: boolean = false;
  storeToDelete: Store | null = null;
  confirmationName: string = '';
  isDeleting: boolean = false;
  private destroyRef = inject(DestroyRef);
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private storeService :StoreService,
    private uiService : UiService
  ){
    this.initializeSearchForm()
  }

  ngOnInit(): void {
      this.loadStores()
      this.setupSearchSubscription();
  }

  formatDate = formatDate;
  formatTime = formatTime;

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      code: [''],
      mobile: [''],
      // Keep status empty by default to represent "All"
      status: ['']
    });
  }
  private setupSearchSubscription(): void {
      this.searchForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(values => {
        // Update filter object
        this.filter = { ...values };
        // Remove empty values
        Object.keys(this.filter).forEach(key => {
          if (!this.filter[key]) {
            delete this.filter[key];
          }
        });
        
        // Reset to first page and reload
        this.paginationConfig.page = 1;
        this.loadStores();
      });
    }
  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }
  goToDashBoard() : void{
    this.router.navigate(['dashboard'])
  }

  gotoAddUStore(): void{
    this.router.navigate(['stores/create'])
  }

   getUserInitials(name: string): string {
    if (!name) return '';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      // Single name - return first two characters
      return names[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple names - return first letter of first and last name
      const firstInitial = names[0].charAt(0);
      const lastInitial = names[names.length - 1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.page = 1;
    this.loadStores();
  }

  sortBy(field: string): void {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.paginationConfig.page = 1;
      this.loadStores();
    }

  loadStores() {
      this.loading = true;
      // Add sort params to filter
      const queryFilter = { ...this.filter };
      if (this.sortField) {
        queryFilter['sortField'] = this.sortField;
        queryFilter['sortDirection'] = this.sortDirection;
      }


      this.storeService.getAllStores(this.paginationConfig.page, this.paginationConfig.limit, queryFilter).subscribe({
        next: (result: PaginatedResponse<Store>) => {
          this.stores = result.items;
          console.log(this.stores);
          
          this.paginationConfig = {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: Math.ceil(result.total / result.limit)
          };
          this.loading = false;
        },
        error: (error) => {
          this.uiService.error('Failed to load stores. Please try again.', 'Error');
          this.loading = false;
        }
      });
      
  }
  // Whether any filters are currently active
  hasActiveFilters(): boolean {
    return Object.keys(this.filter).length > 0;
  }

  // Generate a user-friendly message for empty results when filters are applied
  getNoResultsMessage(): string {
    if (!this.hasActiveFilters()) {
      return 'No stores found.';
    }

    const parts: string[] = [];
    const mapLabel = (key: string): string => {
      switch (key) {
        case 'name': return 'Name';
        case 'code': return 'Code';
        case 'mobile': return 'Mobile';
        case 'status': return 'Status';
        default: return key;
      }
    };

    Object.keys(this.filter).forEach(key => {
      if (key === 'status') {
        const val = this.filter[key];
        const label = val === 'active' ? 'Active' : val === 'inactive' ? 'Inactive' : '';
        if (label) parts.push(`${mapLabel(key)}: ${label}`);
      } else if (this.filter[key]) {
        parts.push(`${mapLabel(key)}: "${this.filter[key]}"`);
      }
    });

    const filtersDesc = parts.join(', ');
    return filtersDesc
      ? `No stores found for filters — ${filtersDesc}.`
      : 'No stores found.';
  }
   onPaginationChange(change: PaginationChange) {
      this.paginationConfig.page = change.page;
      this.paginationConfig.limit = change.limit;
      this.loadStores();
    }

  onEditUser(store : Store):void{
    this.router.navigate([`/stores/${store._id}/edit`])
  }

  onDeleteUser(store : Store):void{
    this.storeToDelete = store;
    this.confirmationName = '';
    this.showDeletePopup = true;
    this.isDeleting = false;
  }

  confirmDeleteStore(): void {
    if (!this.storeToDelete || this.confirmationName.trim() !== (this.storeToDelete.name || '') || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    const storeId = this.storeToDelete._id;
    const storeName = this.storeToDelete.name;

    if (!storeId) {
      this.uiService.error('Unable to delete store. Invalid store ID.', 'Error');
      this.isDeleting = false;
      return;
    }

    this.storeService.delete(storeId).subscribe({
      next: () => {
        // Remove locally
        this.stores = this.stores.filter(s => s._id !== storeId);

        // If the deleted store is currently set in app state,
        // set the next available store if present, otherwise clear it
        if (appState.store && appState.store._id === storeId) {
          if (this.stores.length > 0) {
            const nextStore = this.stores[0];
            appState.setStore({
              _id: nextStore._id || '',
              name: nextStore.name || '',
              code: nextStore.code || '',
              status: (nextStore.status as 'active' | 'inactive') || 'active',
              createdBy: nextStore.createdBy || ''
            });
          } else {
            appState.setStore(null);
          }
        }
        
        // Update pagination if needed
        if (this.stores.length === 0 && this.paginationConfig.page > 1) {
          this.paginationConfig.page--;
          this.loadStores();
        } else {
          this.paginationConfig.total--;
          this.paginationConfig.pages = Math.ceil(this.paginationConfig.total / this.paginationConfig.limit);
        }

        

        this.closeDeletePopup();
        this.isDeleting = false;
        this.showDeletePopup = false;
        this.uiService.success(`Store "${storeName}" has been successfully deleted.`, 'Success');
      },
      error: () => {
        this.uiService.error(`Failed to delete store "${storeName}". Please try again.`, 'Error');
        this.isDeleting = false;
      }
    });
  }

  closeDeletePopup(): void {
    if (this.isDeleting) return;
    this.showDeletePopup = false;
    this.storeToDelete = null;
    this.confirmationName = '';
  }

  onStaffView(store: Store) : void{
    this.router.navigate([`stores/${store._id}/staffs`])

  }
}

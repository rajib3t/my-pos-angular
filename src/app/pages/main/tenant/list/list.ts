import { TenantService, Tenant, PaginatedResult } from '@/app/services/tenant.service';
import { Component , OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent, PaginationConfig, PaginationChange } from '@/app/shared/components/pagination/pagination';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [
     CommonModule,
     PaginationComponent,
     ReactiveFormsModule,
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class TenantList implements OnInit, OnDestroy {
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  tenants: Tenant[] = [];
  paginationConfig: PaginationConfig = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };
  filter: { [key: string]: any } = {};
  loading: boolean = false;
  searchForm: FormGroup;
  private destroy$ = new Subject<void>();
  showSearchFilters: boolean = false;
 
  loadTenants() {
    this.loading = true;
    // Add sort params to filter
    const queryFilter = { ...this.filter };
    if (this.sortField) {
      queryFilter['sortField'] = this.sortField;
      queryFilter['sortDirection'] = this.sortDirection;
    }
    this.tenantService.getAllTenants(this.paginationConfig.page, this.paginationConfig.limit, queryFilter).subscribe({
      next: (result: PaginatedResult) => {
       
        
        this.tenants = result.items;
        this.paginationConfig = {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.pages
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching tenants:', error);
        this.loading = false;
      }
    });
  }

  onPaginationChange(change: PaginationChange) {
    this.paginationConfig.page = change.page;
    this.paginationConfig.limit = change.limit;
    this.loadTenants();
  }

  trackByTenant(index: number, tenant: Tenant): string {
    return tenant._id || tenant.id || index.toString();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  constructor(
    private tenantService: TenantService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      name: [''],
      subdomain: [''],
      createdAtFrom: [''],
      createdAtTo: ['']
    });
  }

  ngOnInit(): void {
    this.loadTenants();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onSearch();
      });
  }

  onSearch(): void {
    const formValues = this.searchForm.value;
    this.filter = {};

    // Add name filter
    if (formValues.name && formValues.name.trim()) {
      this.filter['name'] = formValues.name.trim();
    }

    // Add subdomain filter
    if (formValues.subdomain && formValues.subdomain.trim()) {
      this.filter['subdomain'] = formValues.subdomain.trim();
    }

    // Add date range filters
    if (formValues.createdAtFrom) {
      this.filter['createdAtFrom'] = formValues.createdAtFrom;
    }
    if (formValues.createdAtTo) {
      this.filter['createdAtTo'] = formValues.createdAtTo;
    }

    // Reset to first page when searching
    this.paginationConfig.page = 1;
    this.loadTenants();
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.page = 1;
    this.loadTenants();
  }

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadTenants();
  }


    onEditTenant(tenant: Tenant): void {
    // TODO: Implement edit tenant functionality
   this.router.navigate([`/tenants/${tenant.id || tenant._id}/edit`]);
  }
}

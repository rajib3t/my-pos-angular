import { TenantService, Tenant, PaginatedResult } from '@/app/services/tenant.service';
import { Component , OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent, PaginationConfig, PaginationChange } from '@/app/shared/components/pagination/pagination';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UiService } from '@/app/services/ui.service';
import { formatTime, formatDate } from '@/app/shared/utils/date-time.utils';
import { LucideAngularModule, LayoutList, SquarePlus, House } from 'lucide-angular';
import { ConfigService } from '@/app/services/config.service';
@Component({
  selector: 'app-list',
  imports: [
     CommonModule,
     PaginationComponent,
     ReactiveFormsModule,
     FormsModule,
     LucideAngularModule
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class TenantList implements OnInit, OnDestroy {
  readonly HouseIcon = LayoutList;
  readonly TenantAddIcon = SquarePlus;
  readonly mainDomain: string;
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

  // Delete popup properties
  showDeletePopup: boolean = false;
  tenantToDelete: Tenant | null = null;
  confirmationName: string = '';
  isDeleting: boolean = false;

  // Use global utility functions for date/time formatting
  formatDate = formatDate;
  formatTime = formatTime;

  constructor(
    private tenantService: TenantService,
    private fb: FormBuilder,
    private router: Router,
    private uiService: UiService,
    private configService: ConfigService
  ) {
    this.mainDomain = this.configService.mainDomain;
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
        this.uiService.error('Failed to load tenants. Please try again.', 'Error');
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

  onDeleteTenant(tenant: Tenant): void {
    this.tenantToDelete = tenant;
    this.confirmationName = '';
    this.showDeletePopup = true;
  }

  closeDeletePopup(): void {
    if (this.isDeleting) return; // Prevent closing during deletion
    this.showDeletePopup = false;
    this.tenantToDelete = null;
    this.confirmationName = '';
  }

  confirmDeleteTenant(): void {
    if (!this.tenantToDelete || this.confirmationName.trim() !== this.tenantToDelete.name || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    const tenantId = this.tenantToDelete.id || this.tenantToDelete._id;
    const tenantName = this.tenantToDelete.name;

    if (!tenantId) {
      this.uiService.error('Unable to delete tenant. Invalid tenant ID.', 'Error');
      this.isDeleting = false;
      return;
    }

    this.tenantService.deleteTenant(tenantId).subscribe({
      next: (response) => {
        // Remove the tenant from the local array
        this.tenants = this.tenants.filter(t => (t.id || t._id) !== tenantId);
        
        // Update pagination if needed
        if (this.tenants.length === 0 && this.paginationConfig.page > 1) {
          this.paginationConfig.page--;
          this.loadTenants();
        } else {
          // Update total count
          this.paginationConfig.total--;
          this.paginationConfig.pages = Math.ceil(this.paginationConfig.total / this.paginationConfig.limit);
        }

        this.closeDeletePopup();
        this.isDeleting = false;
        this.showDeletePopup = false;
        
        this.uiService.success(`Sub Account "${tenantName}" has been successfully deleted.`, 'Success', 2000);
      },
      error: (error) => {
        this.uiService.error(`Failed to delete sub account "${tenantName}". Please try again.`, 'Error', 2000);
        this.isDeleting = false;
      }
    });
  }

  canDeleteTenant(): boolean {
    return this.tenantToDelete !== null &&
           this.confirmationName.trim() === this.tenantToDelete.name &&
           !this.isDeleting;  
  }
  
  gotoAddTenant(): void {
    this.router.navigate(['/tenants/create']);
  }

  onUsersTenant (tenant : Partial<Tenant>): void {
    this.router.navigate(
      [`/tenants/${tenant._id}/users`]
    )
  }

  openSubdomain(tenant: Tenant): void {
    const url = `http://${tenant.subdomain}.${this.mainDomain}`;
    window.open(url, '_blank');
  }

}

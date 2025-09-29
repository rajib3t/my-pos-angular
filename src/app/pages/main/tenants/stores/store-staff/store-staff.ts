import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Store as StoreIcon, Album as DashboardIcon, Trash2, Edit3, Users, CheckSquare } from 'lucide-angular';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { StoreService, Store, StaffMemberStrict, StaffRole, StaffStatus } from '@/app/services/store.service';
import { UiService } from '@/app/services/ui.service';
import {FormGroup, ReactiveFormsModule, FormBuilder, FormsModule} from '@angular/forms';

@Component({
  selector: 'app-store-staff',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './store-staff.html',
  styleUrl: './store-staff.css'
})
export class StoreStaff  implements OnInit{
  readonly StoreIcon = StoreIcon;
  readonly DashboardIcon = DashboardIcon;
  readonly Trash2 = Trash2;
  readonly Edit3 = Edit3;
  readonly Users = Users;
  readonly CheckSquare = CheckSquare;

  storeId: string | null = null;
   store:Partial< Store> | null = null;
  filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  stores : StaffMemberStrict[] | null = null
  paginationConfig: PaginationConfig = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };

  loading : boolean = false;
  showSearchFilters: boolean = false;
  searchForm!: FormGroup;
  
  // Bulk operations
  selectedStaff: Set<string> = new Set();
  bulkActionLoading: boolean = false;
  
  // Enums for template
  readonly StaffRole = StaffRole;
  readonly StaffStatus = StaffStatus;
  constructor(
    private router: Router,
    private storeService: StoreService,
    private uiService: UiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ){
    this.initializeSearchForm();
  }

  ngOnInit(): void {
     this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');

     this.loadStores(this.storeId as string);
     this.setupSearchSubscription();
     this.loadStoreDetails()
  }



  goToDashBoard():void{
    this.router.navigate(['/dashboard']);
  }

  goToStores(): void{
    this.router.navigate(['/stores'])
  }

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      email: [''],
      mobile: [''],
      role: [''],
      status: ['']
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges.subscribe(values => {
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
      this.loadStores(this.storeId as string);
    });
  }

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.page = 1;
    this.loadStores(this.storeId as string);
  }


  loadStores(storeId: string) {
        this.loading = true;
        // Add sort params to filter
        const queryFilter = { ...this.filter };
        if (this.sortField) {
          queryFilter['sortField'] = this.sortField;
          queryFilter['sortDirection'] = this.sortDirection;
        }
  
  
        this.storeService.getStaffs(storeId , this.paginationConfig.page, this.paginationConfig.limit, queryFilter).subscribe({
          next: (result: any) => {
            this.stores = result.items;
            
            
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


    onPageChange(event: PaginationChange): void {
      this.paginationConfig.page = event.page;
      this.paginationConfig.limit = event.limit;
      this.loadStores(this.storeId as string)
    }



    addStoreStaff(storeId: string) : void{
      this.router.navigate(['/stores', storeId, 'staffs-add'])

    }

    getUserInitials(name: string): string {
      if (!name) return '';
      
      const names = name.trim().split(' ');
      if (names.length === 1) {
        // Single word - return first two characters
        return names[0].substring(0, 2).toUpperCase();
      } else {
        // Multiple words - return first letter of each word
        return names.map(name => name.charAt(0).toUpperCase()).join('');
      }
    }

    removeStaff(staff: StaffMemberStrict): void {
      if (!this.storeId) {
        this.uiService.error('Store ID not found', 'Error');
        return;
      }

      // Show confirmation dialog
      const confirmed = confirm(`Are you sure you want to remove ${staff.user.name} from this store?`);
      if (!confirmed) {
        return;
      }

      this.storeService.removeStaff(this.storeId, staff.user._id).subscribe({
        next: (response) => {
          this.uiService.success(`${staff.user.name} has been removed from the store successfully`, 'Staff Removed');
          // Reload the staff list
          this.loadStores(this.storeId as string);
        },
        error: (error) => {
          console.error('Remove staff error:', error);
          
          // Handle different error types based on status code
          if (error.status === 400) {
            this.uiService.error(error.error?.message || 'Invalid request. Please check the data and try again.', 'Validation Error');
          } else if (error.status === 404) {
            this.uiService.error('Staff member not found in this store.', 'Not Found');
          } else if (error.status === 500) {
            this.uiService.error('Server error occurred. Please try again later.', 'Server Error');
          } else {
            this.uiService.error('Failed to remove staff member. Please try again.', 'Error');
          }
        }
      });
    }

    // Bulk selection methods
    toggleStaffSelection(staffId: string): void {
      if (this.selectedStaff.has(staffId)) {
        this.selectedStaff.delete(staffId);
      } else {
        this.selectedStaff.add(staffId);
      }
    }

    toggleSelectAll(): void {
      if (!this.stores) return;
      
      if (this.selectedStaff.size === this.stores.length) {
        this.selectedStaff.clear();
      } else {
        this.selectedStaff.clear();
        this.stores.forEach(staff => this.selectedStaff.add(staff.user._id));
      }
    }

    isStaffSelected(staffId: string): boolean {
      return this.selectedStaff.has(staffId);
    }

    get isAllSelected(): boolean {
      return this.stores ? this.selectedStaff.size === this.stores.length : false;
    }

    get hasSelectedStaff(): boolean {
      return this.selectedStaff.size > 0;
    }

    // Bulk remove staff
    removeSelectedStaff(): void {
      if (!this.storeId || this.selectedStaff.size === 0) {
        this.uiService.error('No staff members selected', 'Error');
        return;
      }

      const selectedCount = this.selectedStaff.size;
      const confirmed = confirm(`Are you sure you want to remove ${selectedCount} staff member(s) from this store?`);
      if (!confirmed) {
        return;
      }

      this.bulkActionLoading = true;
      const userIds = Array.from(this.selectedStaff);

      this.storeService.removeMultipleStaff(this.storeId, userIds).subscribe({
        next: (responses) => {
          const successCount = responses.filter((r: any) => r).length;
          this.uiService.success(`${successCount} staff member(s) removed successfully`, 'Bulk Remove Complete');
          this.selectedStaff.clear();
          this.loadStores(this.storeId as string);
          this.bulkActionLoading = false;
        },
        error: (error) => {
          console.error('Bulk remove error:', error);
          this.uiService.error('Failed to remove some staff members. Please try again.', 'Bulk Remove Error');
          this.bulkActionLoading = false;
        }
      });
    }

    // Update staff status
    updateStaffStatus(staff: StaffMemberStrict, newStatus: StaffStatus): void {
      if (!this.storeId) {
        this.uiService.error('Store ID not found', 'Error');
        return;
      }

      this.storeService.updateStaffStatus(this.storeId, staff.user._id, newStatus).subscribe({
        next: (response) => {
          this.uiService.success(`${staff.user.name}'s status updated to ${newStatus}`, 'Status Updated');
          this.loadStores(this.storeId as string);
        },
        error: (error) => {
          console.error('Update status error:', error);
          this.uiService.error('Failed to update staff status. Please try again.', 'Update Error');
        }
      });
    }

    // Update staff role
    updateStaffRole(staff: StaffMemberStrict, newRole: StaffRole): void {
      if (!this.storeId) {
        this.uiService.error('Store ID not found', 'Error');
        return;
      }

      this.storeService.updateStaffRole(this.storeId, staff.user._id, newRole).subscribe({
        next: (response) => {
          this.uiService.success(`${staff.user.name}'s role updated to ${newRole}`, 'Role Updated');
          this.loadStores(this.storeId as string);
        },
        error: (error) => {
          console.error('Update role error:', error);
          this.uiService.error('Failed to update staff role. Please try again.', 'Update Error');
        }
      });
    }

  
    // Get status badge class
    getStatusBadgeClass(status: boolean): string {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

    // Get role badge class
    getRoleBadgeClass(role: StaffRole): string {
      switch (role) {
        case StaffRole.OWNER:
          return 'bg-amber-100 text-amber-800';
        case StaffRole.ADMIN:
          return 'bg-purple-100 text-purple-800';
        case StaffRole.MANAGER:
          return 'bg-blue-100 text-blue-800';
        case StaffRole.STAFF:
          return 'bg-pink-100 text-pink-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    // Whether any filters are currently active
    hasActiveFilters(): boolean {
      return Object.keys(this.filter).length > 0;
    }

    // Generate a user-friendly message for empty results
    getNoResultsMessage(): string {
      if (!this.hasActiveFilters()) {
        return 'No staff members found for this store.';
      }

      const parts: string[] = [];
      const mapLabel = (key: string): string => {
        switch (key) {
          case 'name': return 'Name';
          case 'email': return 'Email';
          case 'mobile': return 'Mobile';
          case 'role': return 'Role';
          case 'status': return 'Status';
          default: return key;
        }
      };

      Object.keys(this.filter).forEach(key => {
        if (key === 'role') {
          const val = this.filter[key];
          const label = val === StaffRole.STAFF ? 'Staff' : 
                       val === StaffRole.MANAGER ? 'Manager' : 
                       val === StaffRole.ADMIN ? 'Admin' : 
                       val === StaffRole.OWNER ? 'Owner' : '';
          if (label) parts.push(`${mapLabel(key)}: ${label}`);
        } else if (key === 'status') {
          const val = this.filter[key];
          const label = val === StaffStatus.ACTIVE ? 'Active' : 
                       val === StaffStatus.PENDING ? 'Pending' : 
                       val === StaffStatus.INACTIVE ? 'Inactive' : 
                       val === StaffStatus.SUSPENDED ? 'Suspended' : '';
          if (label) parts.push(`${mapLabel(key)}: ${label}`);
        } else if (this.filter[key]) {
          parts.push(`${mapLabel(key)}: "${this.filter[key]}"`);
        }
      });

      const filtersDesc = parts.join(', ');
      return filtersDesc
        ? `No staff members found for filters — ${filtersDesc}.`
        : 'No staff members found for this store.';
    }



    loadStoreDetails(): void {
      if (!this.storeId) return;
      
      this.storeService.getById(this.storeId).subscribe({
        next: (store: Store) => {
          this.store = store;
        },
        error: (error: any) => {
          this.uiService.error('Failed to load store details', 'Error');
        }
      });
    }
}

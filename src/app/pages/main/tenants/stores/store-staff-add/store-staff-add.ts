import { User, UserService, UserList } from '@/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Store as StoreIcon, Album as DashboardIcon, Users as UsersIcon, Search as SearchIcon, Plus as PlusIcon, Check as CheckIcon, X as XIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StoreService, Store } from '@/app/services/store.service';
import { UiService } from '@/app/services/ui.service';
import { PaginatedResponse } from '@/app/services/api-response.model';
import { PaginationComponent, PaginationConfig, PaginationChange } from '@/app/shared/components/pagination/pagination';

interface StoreUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  isSelected?: boolean;
  isAlreadyStaff?: boolean;
}


@Component({
  selector: 'app-store-staff-add',
  imports: [
    LucideAngularModule,
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './store-staff-add.html',
  styleUrl: './store-staff-add.css'
})
export class StoreStaffAdd implements OnInit {
  readonly StoreIcon = StoreIcon;
  readonly DashboardIcon = DashboardIcon;
  readonly UsersIcon = UsersIcon;
  readonly SearchIcon = SearchIcon;
  readonly PlusIcon = PlusIcon;
  readonly CheckIcon = CheckIcon;
  readonly XIcon = XIcon;
  readonly ArrowLeftIcon = ArrowLeftIcon;

  storeId: string | null = null;
  store: Store | null = null;
  users: StoreUser[] = [];
  selectedUsers: StoreUser[] = [];
  existingStaffIds: string[] = [];
  loading: boolean = false;
  adding: boolean = false;
  searchForm!: FormGroup;
  showSearchFilters: boolean = false;
  
  // Pagination
  paginationConfig: PaginationConfig = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };

  // Filter
  filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private router: Router,
    private userService: UserService,
    private storeService: StoreService,
    private uiService: UiService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.initializeSearchForm();
  }

  ngOnInit(): void {
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
    if (this.storeId) {
      this.loadStoreDetails();
      this.loadExistingStaff();
      this.loadUsers(this.storeId);
      this.setupSearchSubscription();
    } else {
      this.uiService.error('Store ID not found', 'Error');
      this.goToStaffs();
    }
  }

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      email: [''],
      role: [''],
      status: ['']
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges.subscribe(values => {
      this.filter = { ...values };
      Object.keys(this.filter).forEach(key => {
        if (!this.filter[key]) {
          delete this.filter[key];
        }
      });
      this.paginationConfig.page = 1;
      this.loadUsers(this.storeId as string);
    });
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

  loadExistingStaff(): void {
    if (!this.storeId) return;
    
    // Load existing staff for the store
    this.storeService.getStaffs(this.storeId, 1, 1000).subscribe({
      next: (staffData: any) => {
        if (staffData && staffData.items) {
          this.existingStaffIds = staffData.items.map((s: any) => s._id);
        } else {
          this.existingStaffIds = [];
        }
      },
      error: (error: any) => {
        console.log('No existing staff or error loading staff');
        this.existingStaffIds = [];
      }
    });
  }

  loadUsers(storeId:string): void {
    this.loading = true;
    const queryFilter = { ...this.filter };
    if (this.sortField) {
      queryFilter['sortField'] = this.sortField;
      queryFilter['sortDirection'] = this.sortDirection;
    }

    this.storeService.getStoreCandidates(storeId,this.paginationConfig.page, this.paginationConfig.limit, queryFilter).subscribe({
      next: (result: UserList) => {
        this.users = result.items.map(user => ({
          ...user,
          isSelected: this.selectedUsers.some(su => su._id === user._id),
          isAlreadyStaff: this.existingStaffIds.includes(user._id)
        }));
        
        this.paginationConfig = {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: Math.ceil(result.total / result.limit)
        };
        this.loading = false;
      },
      error: (error) => {
        this.uiService.error('Failed to load users', 'Error');
        this.loading = false;
      }
    });
  }

  toggleUserSelection(user: StoreUser): void {
    if (user.isAlreadyStaff) return;

    const index = this.selectedUsers.findIndex(su => su._id === user._id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
      user.isSelected = false;
    } else {
      this.selectedUsers.push(user);
      user.isSelected = true;
    }
  }

  selectAllVisibleUsers(): void {
    const availableUsers = this.users.filter(u => !u.isAlreadyStaff);
    availableUsers.forEach(user => {
      if (!user.isSelected) {
        this.selectedUsers.push(user);
        user.isSelected = true;
      }
    });
  }

  clearAllSelections(): void {
    this.users.forEach(user => user.isSelected = false);
    this.selectedUsers = [];
  }

  removeSelectedUser(user: StoreUser): void {
    const index = this.selectedUsers.findIndex(su => su._id === user._id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
      const userInList = this.users.find(u => u._id === user._id);
      if (userInList) {
        userInList.isSelected = false;
      }
    }
  }

  addSelectedStaff(): void {
    if (this.selectedUsers.length === 0) {
      this.uiService.warning('Please select at least one user to add as staff', 'No Selection');
      return;
    }

    if (!this.storeId) {
      this.uiService.error('Store ID not found', 'Error');
      return;
    }

    this.adding = true;
    const userIds = this.selectedUsers.map(u => u._id);

    // Use the new addMultipleStaff method to add all selected users
    this.storeService.addMultipleStaff(this.storeId, userIds).subscribe({
      next: (responses) => {
        const successCount = responses.filter((r: any) => r && r.data).length;
        const failureCount = responses.length - successCount;
        
        if (failureCount === 0) {
          this.uiService.success(`Successfully added ${successCount} staff member(s) to the store`, 'Success');
        } else if (successCount > 0) {
          this.uiService.warning(`Added ${successCount} staff member(s). ${failureCount} failed to add.`, 'Partial Success');
        } else {
          this.uiService.error('Failed to add any staff members', 'Error');
        }
        
        this.adding = false;
        if (successCount > 0) {
          this.goToStaffs()
        }
      },
      error: (error) => {
        this.adding = false;
        this.handleAddStaffError(error);
      }
    });
  }

  private handleAddStaffError(error: any): void {
    console.error('Error adding staff:', error);
    
    // Handle different types of errors based on your backend response
    if (error.status === 400) {
      // Validation error
      const details = error.error?.details || [];
      if (details.length > 0) {
        this.uiService.error(`Validation failed: ${details.join(', ')}`, 'Validation Error');
      } else {
        this.uiService.error(error.error?.message || 'Invalid request data', 'Validation Error');
      }
    } else if (error.status === 409) {
      // Conflict error (user already exists as staff)
      const details = error.error?.details || [];
      if (details.length > 0) {
        this.uiService.warning(`Some users are already staff members: ${details.join(', ')}`, 'Conflict');
      } else {
        this.uiService.warning(error.error?.message || 'Some users are already staff members', 'Conflict');
      }
    } else if (error.status === 500) {
      // Server error
      this.uiService.error('Server error occurred. Please try again later.', 'Server Error');
    } else {
      // Generic error
      this.uiService.error(error.error?.message || 'Failed to add staff members', 'Error');
    }
  }

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.page = 1;
    this.loadUsers(this.storeId as string);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.paginationConfig.page = 1;
    this.loadUsers(this.storeId as string);
  }

  onPaginationChange(change: PaginationChange): void {
    this.paginationConfig.page = change.page;
    this.paginationConfig.limit = change.limit;
    this.loadUsers(this.storeId as string);
  }

  getUserInitials(name: string): string {
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

  getStatusBadgeClass(status: boolean): string {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(status: boolean): string {
    return status ? 'Active' : 'Inactive';
  }

  // Helper method for checkbox state
  isAllAvailableUsersSelected(): boolean {
    const availableUsers = this.users.filter(u => !u.isAlreadyStaff);
    return availableUsers.length > 0 && availableUsers.every(u => u.isSelected);
  }

  // Helper method for checkbox toggle
  toggleAllUsers(): void {
    if (this.isAllAvailableUsersSelected()) {
      this.clearAllSelections();
    } else {
      this.selectAllVisibleUsers();
    }
  }

  goToStaffs(): void {
    this.router.navigate(['/stores', this.storeId, 'staffs']);
  }

  goToDashBoard(): void {
    this.router.navigate(['dashboard']);
  }

  goToAddUser():void{
    this.router.navigate(['/users/create'])
  }

  goToStores():void{
    this.router.navigate(['/stores'])
  }
}

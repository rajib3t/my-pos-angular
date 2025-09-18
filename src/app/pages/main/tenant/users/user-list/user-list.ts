import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaginatedResult, TenantService } from '@/app/services/tenant.service';
import { PaginationChange, PaginationConfig, PaginationComponent } from '@/app/shared/components/pagination';
import { UiService } from '@/app/services/ui.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { formatTime, formatDate } from '@/app/shared/utils/date-time.utils';
import { User, UserService , UserList as UserListResponse} from '@/app/services/user.service';
import { LayoutList, LucideAngularModule , SquarePen, UserPlus, KeyIcon} from 'lucide-angular';
import { UserPasswordReset } from '@/app/shared/components/popup/user-password-reset/user-password-reset';
@Component({
  selector: 'app-tenant-user-list',
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    UserPasswordReset
],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  readonly EditIcon = SquarePen;
  readonly HouseIcon = LayoutList;
  readonly UserAddIcon = UserPlus;
  readonly KeyIcon = KeyIcon;
  tenantId: string | null = null;
  showSearchFilters: boolean = false;
  loading: boolean = false;
  filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchForm!: FormGroup;


  // Delete popup properties
  showDeletePopup: boolean = false;
  userToDelete: UserListResponse['items'][0] | null = null;
  confirmationName: string = '';
  isDeleting: boolean = false;

  // Password reset popup properties
  showResetPasswordPopup: boolean = false;
  userToResetPassword: UserListResponse['items'][0] | null = null;
  isResettingPassword: boolean = false;
   
  users: UserListResponse['items'] = [];
    paginationConfig: PaginationConfig = {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    };

  constructor(
    private uiService: UiService, 
    private tenantService: TenantService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder
  ) { 
    this.initializeSearchForm();
  }

    // Use global utility functions for date/time formatting
    formatDate = formatDate;
    formatTime = formatTime;

    private initializeSearchForm(): void {
      this.searchForm = this.fb.group({
        name: [''],
        email: [''],
        mobile: [''],
        role: [''],
        status: [true]
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
        this.loadUsers(this.tenantId);
      });
    }

  loadUsers(tenantId: string | null) {
      if (!tenantId) {
        return;
      }
      this.loading = true;
      // Add sort params to filter
      const queryFilter = { ...this.filter };
      if (this.sortField) {
        queryFilter['sortField'] = this.sortField;
        queryFilter['sortDirection'] = this.sortDirection;
      }
      this.userService.getUsers(this.paginationConfig.page, this.paginationConfig.limit, queryFilter, tenantId).subscribe({
        next: (result: UserListResponse) => {
          this.users = result.items;
          this.paginationConfig = {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.page
          };
          this.loading = false;
        },
        error: (error) => {
          this.uiService.error('Failed to load users. Please try again.', 'Error');
          this.loading = false;
        }
      });
    }

    sortBy(field: string): void {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.paginationConfig.page = 1;
      this.loadUsers(this.tenantId);
    }
  
    onPaginationChange(change: PaginationChange) {
      this.paginationConfig.page = change.page;
      this.paginationConfig.limit = change.limit;
      this.loadUsers(this.tenantId);
    }

  ngOnInit(): void {
      this.activatedRoute.paramMap.subscribe(params => {
        this.tenantId = params.get('id');
      });
      this.loadUsers(this.tenantId);
      this.setupSearchSubscription();
   }

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }


  clearSearch(): void {
    this.searchForm.reset();
    this.filter = {};
    this.paginationConfig.page = 1;
    this.loadUsers(this.tenantId);
  }


  onEditUser(user: UserListResponse['items'][0]): void {
    console.log(user);
    
    this.router.navigate([`/tenants/${this.tenantId}/users/${user._id}/edit`]);
  }

  onDeleteUser(user: UserListResponse['items'][0]): void {
    this.userToDelete = user;
    this.confirmationName = '';
    this.showDeletePopup = true;
    this.isDeleting = false;
    // Reset confirmation name
    this.confirmationName = '';
  }


  gotoAddUser(): void {
    
    this.router.navigate([`/tenants/${this.tenantId}/users/create`]);
    
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


  confirmDeleteUser(): void {
    console.log(this.userToDelete);
    
    if (!this.userToDelete || this.confirmationName.trim() !== this.userToDelete.name || this.isDeleting) {
      return;
    }


    
    this.isDeleting = true;
    const userId = this.userToDelete._id;
    const userName = this.userToDelete.name;

    if (!userId) {
      this.uiService.error('Unable to delete user. Invalid user ID.', 'Error');
      this.isDeleting = false;
      return;
    }

    this.userService.deleteUser(userId, this.tenantId as string).subscribe({
      next: (response) => {
        // Remove the user from the local array
        this.users = this.users.filter(u => ( u._id) !== userId);

        // Update pagination if needed
        if (this.users.length === 0 && this.paginationConfig.page > 1) {
          this.paginationConfig.page--;
          this.loadUsers(this.tenantId);
        } else {
          // Update total count
          this.paginationConfig.total--;
          this.paginationConfig.pages = Math.ceil(this.paginationConfig.total / this.paginationConfig.limit);
        }

        this.closeDeletePopup();
        this.isDeleting = false;
        this.showDeletePopup = false;

        this.uiService.success(`User "${userName}" has been successfully deleted.`, 'Success');
      },
      error: (error) => {
        this.uiService.error(`Failed to delete user "${userName}". Please try again.`, 'Error');
        this.isDeleting = false;
      }
    });
  }

   closeDeletePopup(): void {
    if (this.isDeleting) return; // Prevent closing during deletion
    this.showDeletePopup = false;
    this.userToDelete = null;
    this.confirmationName = '';
  }

  backToTenantList(): void {
    this.router.navigate(['/tenants']); 
  }

  gotoEditTenant(): void {
    if (this.tenantId) {
      this.router.navigate([`/tenants/${this.tenantId}/edit`]);
    }
  }
  onChangePassword(user: UserListResponse['items'][0]): void {
    this.userToResetPassword = user;
    this.showResetPasswordPopup = true;
    this.isResettingPassword = false;
  }

  onCloseResetPasswordPopup(): void {
    if (this.isResettingPassword) return; // Prevent closing during reset
    this.showResetPasswordPopup = false;
    this.userToResetPassword = null;
  }

  onPasswordReset(event: { user: Partial<UserListResponse['items'][0]>, success: boolean, error?: any }): void {
    if (event.success) {
      this.uiService.success(`Password for user "${event.user.name}" has been successfully reset.`, 'Success');
    } else {
      this.uiService.error(`Failed to reset password for user "${event.user.name}". Please try again.`, 'Error');
    }
    this.isResettingPassword = false;
  }

  
}

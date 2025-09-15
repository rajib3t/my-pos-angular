import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatedResult, TenantService } from '@/app/services/tenant.service';
import { PaginationChange, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { UiService } from '@/app/services/ui.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { formatTime, formatDate } from '@/app/shared/utils/date-time.utils';
import { User } from '@/app/services/user.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  tenantId: string | null = null;
  showSearchFilters: boolean = false;
  loading: boolean = false;
  filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  users: any[] = [];
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
  ) { }

    // Use global utility functions for date/time formatting
    formatDate = formatDate;
    formatTime = formatTime;

  loadTenants(tenantId: string | null) {
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
      this.tenantService.getTenantUsers(tenantId,this.paginationConfig.page, this.paginationConfig.limit, queryFilter).subscribe({
        next: (result: PaginatedResult) => {
         
          
          this.users = result.items;
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
      this.loadTenants(this.tenantId);
    }

  ngOnInit(): void {
      this.activatedRoute.paramMap.subscribe(params => {
     this.tenantId = params.get('id');
   });
    this.loadTenants( this.tenantId);
   // this.setupSearchSubscription();
  }

  toggleSearchFilters(): void {
    this.showSearchFilters = !this.showSearchFilters;
  }


  clearSearch(): void {
    // this.searchForm.reset();
    // this.filter = {};
    // this.paginationConfig.page = 1;
    // this.loadTenants();
  }


  onEditUser(user: User): void {
    // Navigate to edit user page
  }

  onDeleteUser(user: User): void {
    // Handle user deletion
  }


  gotoAddUser(): void {
    
    this.router.navigate([`/tenants/${this.tenantId}/users/create`]);
    
  }
}

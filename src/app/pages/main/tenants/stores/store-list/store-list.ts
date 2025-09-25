import { CommonModule } from '@angular/common';
import { Component , OnInit} from '@angular/core';
import { LucideAngularModule, Store as StoreIcon, Album as DashboardIcon } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import {FormGroup, ReactiveFormsModule, FormBuilder} from '@angular/forms'
import { formatTime, formatDate } from '@/app/shared/utils/date-time.utils';
import { StoreService } from '@/app/services/store.service';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { PaginatedResponse } from '@/app/services/api-response.model';
import { Store } from '@/app/services/store.service';
import { UiService } from '@/app/services/ui.service';
@Component({
  selector: 'app-store-list',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.css'
})
export class StoreList implements OnInit {
  readonly StoreIcon = StoreIcon
  readonly DashboardIcon = DashboardIcon


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
  }

  formatDate = formatDate;
  formatTime = formatTime;

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      code: [''],
      mobile: [''],
     
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
            pages: result.page
          };
          this.loading = false;
        },
        error: (error) => {
          this.uiService.error('Failed to load stores. Please try again.', 'Error');
          this.loading = false;
        }
      });
      
  }
}

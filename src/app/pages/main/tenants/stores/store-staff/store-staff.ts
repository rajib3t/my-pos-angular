import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Store as StoreIcon, Album as DashboardIcon } from 'lucide-angular';
import { PaginationChange, PaginationComponent, PaginationConfig } from '@/app/shared/components/pagination/pagination';
import { StoreService, Store } from '@/app/services/store.service';
import { UiService } from '@/app/services/ui.service';

@Component({
  selector: 'app-store-staff',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    RouterModule
  ],
  templateUrl: './store-staff.html',
  styleUrl: './store-staff.css'
})
export class StoreStaff  implements OnInit{
  readonly StoreIcon = StoreIcon;
  readonly DashboardIcon = DashboardIcon;



 storeId: string | null = null;


   filter: { [key: string]: any } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  stores : any = []
  paginationConfig: PaginationConfig = {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  };

  loading : boolean = false
  constructor(
    private router: Router,
    private storeService: StoreService,
    private uiService: UiService,
    private activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
     this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');

     this.loadStores(this.storeId as string)
  }



  goToDashBoard():void{
    this.router.navigate(['/dashboard']);
  }

  goToStores(): void{
    this.router.navigate(['/stores'])
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


    onPageChange(event: PaginationChange): void {
      this.paginationConfig.page = event.page;
      this.loadStores(this.storeId as string)
    }



    addStoreStaff(storeId: string) : void{
      this.router.navigate(['/stores', storeId, 'staffs-add'])

    }


}

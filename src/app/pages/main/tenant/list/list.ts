import { TenantService, Tenant } from '@/app/services/tenant.service';
import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-list',
  imports: [
     CommonModule,
  ],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class TenantList implements OnInit {

  tenants: Tenant[] = [];
  totalTenants = 0;
  currentPage = 1;
  pageSize = 1;
  filter: { [key: string]: any } = {};

  loadTenants() {
    this.tenantService.getAllTenants(this.currentPage, this.pageSize, this.filter).subscribe({
      next: (result) => {
        this.tenants = result.items;
        this.totalTenants = result.total;
      },
      error: (error) => {
        console.error('Error fetching tenants:', error);
      }
    });
  }
  constructor(
    private tenantService: TenantService
  ) { }

  ngOnInit(): void {
    this.loadTenants();
  }
}

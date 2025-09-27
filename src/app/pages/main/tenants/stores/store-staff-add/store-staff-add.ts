import { User, UserService } from '@/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { Router , ActivatedRoute} from '@angular/router';
import { LucideAngularModule,Store as StoreIcon, Album as DashboardIcon } from 'lucide-angular';

@Component({
  selector: 'app-store-staff-add',
  imports: [
    LucideAngularModule,
  
  ],
  templateUrl: './store-staff-add.html',
  styleUrl: './store-staff-add.css'
})
export class StoreStaffAdd implements OnInit {
  readonly StoreIcon = StoreIcon;
  readonly DashboardIcon = DashboardIcon;

  storeId : string | null = null
  constructor(
    private router: Router,
    private userService : UserService,
    private activatedRoute: ActivatedRoute
  ) {}


  ngOnInit(): void {
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');

  }

  goToDashBoard() {
    this.router.navigate(['/main/tenant/stores']);
  }
}

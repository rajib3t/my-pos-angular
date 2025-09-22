import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';
import { UiService } from '../../../services/ui.service';
import { Subscription } from 'rxjs';
import { TenantSidebar } from '../tenant-sidebar/tenant-sidebar';
import { LoadingComponent } from '../../components/loading/loading.component';
import { NotificationComponent } from '../../components/notification/notification.component';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    Header, 
    Sidebar, 
    RouterOutlet, 
    TenantSidebar, 
    LoadingComponent, 
    NotificationComponent
  ],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class MainLayout  implements OnInit {
  public isTenantMode = false;
  private uiSubscription!: Subscription;
  constructor(
    private uiService: UiService
  ) {
    // Initialization logic can go here
  }

  ngOnInit() {
    this.isTenantMode = this.uiService.isSubDomain();
   
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }


}

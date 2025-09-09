import { Component, HostListener, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { User , UserService} from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, User as UserIcon, LogOut,KeyRound , Settings} from 'lucide-angular';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
  export class Header implements OnInit, OnDestroy {
    readonly UserIcon = UserIcon;
    readonly Menu = Menu;
    readonly LogOut = LogOut;
    readonly KeyRound = KeyRound;
    readonly SettingsIcon = Settings;
    isSubdomain = false;
  authUser: User | null = null;
   private userSubscription!: Subscription;
  @ViewChild('userMenuButton', { static: false }) userMenuButton!: ElementRef;
  @ViewChild('userMenuDropdown', { static: false }) userMenuDropdown!: ElementRef;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  constructor(private uiService: UiService, private userService: UserService, private apiService: ApiService, private router: Router  ) { }


  ngOnInit() {
    this.userSubscription = this.userService.getAuthUser.subscribe(data => {
     
      this.authUser = data;
    });
    this.isSubdomain = this.uiService.isSubDomain();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
   
    
    
    this.uiService.setOpenMobileMenu(this.isMobileMenuOpen);
  }


  toggleUserMenu() {

    this.isUserMenuOpen = !this.isUserMenuOpen;
    
  }

  // Test method for debugging
  testUserMenu() {
    
    this.toggleUserMenu();
    
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.querySelector('.user-menu-button');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');
    
    if (userMenuButton && userMenuDropdown) {
      if (!userMenuButton.contains(target) && !userMenuDropdown.contains(target)) {
        this.isUserMenuOpen = false;
      }
    }
  }


  logout() {
    // Clear user data first
    this.userService.clearUserData();
    this.apiService.clearAuthData();
    this.apiService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Even if logout API fails, still navigate to login
        this.router.navigate(['/login']);
      }
    });
  }
}

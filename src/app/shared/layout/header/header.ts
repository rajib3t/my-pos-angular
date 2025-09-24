import { Component, HostListener, ElementRef, ViewChild, OnInit, OnDestroy, effect, Signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { User, UserService } from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, User as UserIcon, LogOut, KeyRound, Settings, Bell, Plus, BarChart3, ChevronRight } from 'lucide-angular';
import { appState } from '@/app/state/app.state';
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
    readonly BellIcon = Bell;
    readonly PlusIcon = Plus;
    readonly BarChartIcon = BarChart3;
    readonly ChevronRightIcon = ChevronRight;
    storeID = '';
  isSubdomain = false;
  authUser: User | null = null;
  private userSubscription!: Subscription;
  private destroyRef = inject(DestroyRef);
  @ViewChild('userMenuButton', { static: false }) userMenuButton!: ElementRef;
  @ViewChild('userMenuDropdown', { static: false }) userMenuDropdown!: ElementRef;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  constructor(
    private uiService: UiService, 
    private userService: UserService, 
    private apiService: ApiService, 
    private router: Router
  ) {
    // Set up an effect to watch for store changes
    const storeEffect = effect(() => {
      const store = appState.store;
      this.storeID = store?._id || '';
    });

    // Set up an effect to watch for user changes from app state
    const userEffect = effect(() => {
      const user = appState.user;
      if (user && !this.authUser) {
        // If app state has user but component doesn't, sync it
        this.authUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    });

    // Clean up the effects when the component is destroyed
    this.destroyRef.onDestroy(() => {
      storeEffect.destroy();
      userEffect.destroy();
    });
  }


  ngOnInit() {
    // Subscribe to user changes from user service
    this.userSubscription = this.userService.getAuthUser.subscribe(data => {
      this.authUser = data;
    });
    
    // If we don't have user data from service but have it in app state, use that
    if (!this.authUser && appState.user) {
      this.authUser = {
        id: appState.user.id,
        name: appState.user.name,
        email: appState.user.email,
        role: appState.user.role
      };
    }
    
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

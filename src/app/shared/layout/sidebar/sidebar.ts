import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { Subscription } from 'rxjs';
import { Root } from 'postcss';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { LucideAngularModule, Album, Network} from 'lucide-angular';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  readonly DashboardIcon = Album;
  readonly TenantIcon = Network;
  private uiSubscription!: Subscription;
  private routerSubscription!: Subscription;

  isMobileMenuOpen = false;
  isTenantsSubmenuOpen = false;
  isOrdersSubmenuOpen = false;
  currentRoute = '';

    constructor(private uiService: UiService, private router: Router) { }

    ngOnInit() {
        // Subscribe to mobile menu state
        this.uiSubscription = this.uiService.isMobileMenuOpen.subscribe(isOpen => {
            this.isMobileMenuOpen = isOpen || false;
        });

        // Subscribe to route changes to manage submenu state
        this.routerSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.currentRoute = event.url;
                this.updateSubmenuState();
            });

        // Set initial route
        this.currentRoute = this.router.url;
        this.updateSubmenuState();
    }

    ngOnDestroy() {
        if (this.uiSubscription) {
            this.uiSubscription.unsubscribe();
        }
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
    }

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }

    toggleTenantsSubmenu() {
      this.isTenantsSubmenuOpen = !this.isTenantsSubmenuOpen;
      // Close other submenus when opening this one
      if (this.isTenantsSubmenuOpen) {
        this.isOrdersSubmenuOpen = false;
      }
    }

    toggleOrdersSubmenu() {
      this.isOrdersSubmenuOpen = !this.isOrdersSubmenuOpen;
      // Close other submenus when opening this one
      if (this.isOrdersSubmenuOpen) {
        this.isTenantsSubmenuOpen = false;
      }
    }

    // Animation state getters
    getSubmenuState(isOpen: boolean): string {
        return isOpen ? 'open' : 'closed';
    }

    // Update submenu state based on current route
    updateSubmenuState() {
        // Auto-open tenants submenu if on tenants route
        if (this.currentRoute.includes('/tenants')) {
            this.isTenantsSubmenuOpen = true;
            this.isOrdersSubmenuOpen = false;
        } 
        // Auto-open orders submenu if on orders route
        else if (this.currentRoute.includes('/orders')) {
            this.isOrdersSubmenuOpen = true;
            this.isTenantsSubmenuOpen = false;
        }
        // Close all submenus for other routes
        else {
            this.isTenantsSubmenuOpen = false;
            this.isOrdersSubmenuOpen = false;
        }
    }

    // Check if tenants menu should be highlighted (parent active state)
    isTenantsParentActive(): boolean {
        return this.currentRoute.includes('/tenants');
    }

    // Check if orders menu should be highlighted (parent active state)
    isOrdersParentActive(): boolean {
        return this.currentRoute.includes('/orders');
    }

    // Get CSS classes for parent menu items
    getParentMenuClasses(menuType: string): string {
        const baseClasses = 'menu-item flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group w-full';
        
        let activeClass = '';
        if (menuType === 'tenants' && this.isTenantsParentActive()) {
            activeClass = ' has-active-child';
        } else if (menuType === 'orders' && this.isOrdersParentActive()) {
            activeClass = ' has-active-child';
        }
        
        const hoverClasses = ' text-gray-700 hover:bg-blue-50 hover:text-blue-700';
        
        return baseClasses + activeClass + hoverClasses;
    }
}

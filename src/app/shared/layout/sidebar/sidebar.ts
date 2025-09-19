import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { Subscription } from 'rxjs';
import { Root } from 'postcss';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { LucideAngularModule, Album , ChevronDown, Plus, List, LayoutList, Users} from 'lucide-angular';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, OnDestroy {
  readonly DashboardIcon = Album;
  readonly TenantIcon = LayoutList;
  readonly ChevronDown =ChevronDown;
  readonly PlusIcon = Plus;
  readonly ListIcon = List;
  readonly UsersIcon = Users;
  private uiSubscription!: Subscription;
  private routerSubscription!: Subscription;

  isMobileMenuOpen = false;
  submenuStates: { [key: string]: boolean } = {
    tenants: false,
    users: false,
    customers: false,
    reports: false,
    settings: false
  };
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

    toggleSubmenu(menuKey: string) {
      // Close all other submenus first
      Object.keys(this.submenuStates).forEach(key => {
        if (key !== menuKey) {
          this.submenuStates[key] = false;
        }
      });
      
      // Toggle the selected submenu
      this.submenuStates[menuKey] = !this.submenuStates[menuKey];
    }

    isSubmenuOpen(menuKey: string): boolean {
      return this.submenuStates[menuKey] || false;
    }


    // Update submenu state based on current route
    updateSubmenuState() {
        // Close all submenus first
        Object.keys(this.submenuStates).forEach(key => {
            this.submenuStates[key] = false;
        });

        // Auto-open appropriate submenu based on route
        if (this.currentRoute.includes('/tenants')) {
            this.submenuStates['tenants'] = true;
        } else if (this.currentRoute.includes('/users')) {
            this.submenuStates['users'] = true;
        } else if (this.currentRoute.includes('/customers')) {
            this.submenuStates['customers'] = true;
        } else if (this.currentRoute.includes('/reports')) {
            this.submenuStates['reports'] = true;
        } else if (this.currentRoute.includes('/settings')) {
            this.submenuStates['settings'] = true;
        }
    }

    // Check if a specific route is active (for submenu items)
    isRouteActive(route: string): boolean {
        return this.currentRoute === route;
    }

    // Check if a parent menu should be highlighted (parent active state)
    isParentActive(menuKey: string): boolean {
        const routeMap: { [key: string]: string } = {
            tenants: '/tenants',
            users: '/users',
            customers: '/customers',
            reports: '/reports',
            settings: '/settings'
        };
        return this.currentRoute.includes(routeMap[menuKey] || '');
    }

    // Get CSS classes for parent menu items
    getParentMenuClasses(menuType: string): string {
        const baseClasses = 'modern-menu-item modern-parent-menu w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200 group';
        
        let activeClass = '';
        if (this.isParentActive(menuType)) {
            activeClass = ' has-active-child';
        }
        
        return baseClasses + activeClass;
    }
}

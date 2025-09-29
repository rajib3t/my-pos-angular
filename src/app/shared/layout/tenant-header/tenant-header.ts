import { Component, HostListener, ElementRef, ViewChild, OnInit, OnDestroy, effect, Signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { User, UserService } from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, User as UserIcon, LogOut, KeyRound, Settings, Bell, Plus, BarChart3, ChevronRight, Store as StoreIcon, Check, Star } from 'lucide-angular';
import { appState } from '@/app/state/app.state';
import { StoreService, Store } from '../../../services/store.service';
import { RoleService } from '@/app/services/role.service';

@Component({
  selector: 'app-tenant-header',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './tenant-header.html',
  styleUrl: './tenant-header.css'
})
export class TenantHeader implements OnInit, OnDestroy {
  readonly UserIcon = UserIcon;
    readonly Menu = Menu;
    readonly LogOut = LogOut;
    readonly KeyRound = KeyRound;
    readonly SettingsIcon = Settings;
    readonly BellIcon = Bell;
    readonly PlusIcon = Plus;
    readonly BarChartIcon = BarChart3;
    readonly ChevronRightIcon = ChevronRight;
  readonly StoreIcon = StoreIcon;
  readonly CheckIcon = Check;
  readonly StarIcon = Star;
  storeID = '';
  
  // Store selection properties
  stores: Store[] = [];
  selectedStore: Store | null = null;
  defaultStore: Store | null = null;
  isStoreDropdownOpen = false;
  loadingStores = false;
  storeError: string | null = null;
  
  // Storage keys
  private readonly DEFAULT_STORE_KEY = 'defaultStore';
  private readonly SELECTED_STORE_KEY = 'selectedStore';
  isSubdomain = false;
  authUser: User | null = null;
  private userSubscription!: Subscription;
  private storeChangeSubscription!: Subscription;
  private destroyRef = inject(DestroyRef);
  @ViewChild('userMenuButton', { static: false }) userMenuButton!: ElementRef;
  @ViewChild('userMenuDropdown', { static: false }) userMenuDropdown!: ElementRef;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  roleService = inject(RoleService);
  constructor(
    private uiService: UiService, 
    private userService: UserService, 
    private apiService: ApiService, 
    private router: Router,
    private storeService: StoreService,
   
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
    
    // Load stores and set up store selection
    this.loadDefaultStore();
    this.loadSelectedStore();
    this.loadStores();
    
    // Subscribe to store changes for automatic refresh
    this.setupStoreChangeSubscription();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.storeChangeSubscription) {
      this.storeChangeSubscription.unsubscribe();
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



  logout() {
    // Clear user data first
    this.userService.clearUserData();
    this.apiService.clearAuthData();
    
    // Clear selected store (but keep default store)
    this.clearSelectedStore();
    
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

  private clearSelectedStore() {
    try {
      localStorage.removeItem(this.SELECTED_STORE_KEY);
      this.selectedStore = null;
      console.log('Cleared selected store');
    } catch (error) {
      console.error('Error clearing selected store:', error);
    }
  }

  // Store selection methods
  toggleStoreDropdown() {
    this.isStoreDropdownOpen = !this.isStoreDropdownOpen;
    if (this.isStoreDropdownOpen && this.stores.length === 0) {
      this.loadStores();
    }
  }

  loadStores() {
    this.loadingStores = true;
    this.storeError = null;
    
    this.storeService.getAllStores(1, 100).subscribe({
      next: (response) => {
        this.stores = response.items || [];
        this.loadingStores = false;
        
        // If no store is selected but we have stores, select the first active one or default
        if (!this.selectedStore && this.stores.length > 0) {
          this.autoSelectStore();
        }
      },
      error: (error) => {
        console.error('Error loading stores:', error);
        this.storeError = 'Failed to load stores';
        this.loadingStores = false;
      }
    });
  }

  selectStore(store: Store) {
    this.selectedStore = store;
    this.isStoreDropdownOpen = false;
    
    // Save selected store to localStorage
    this.saveSelectedStore(store);
    
    // Update app state with selected store
    appState.setStore({
      _id: store._id!,
      name: store.name,
      code: store.code || '',
      status: store.status,
      createdBy: store.createdBy || ''
    });
    
    // Update storeID for backward compatibility
    this.storeID = store._id || '';
  }

  setAsDefaultStore(store: Store) {
    this.defaultStore = store;
    
    // Save to localStorage
    try {
      localStorage.setItem(this.DEFAULT_STORE_KEY, JSON.stringify({
        _id: store._id,
        name: store.name,
        code: store.code,
        status: store.status
      }));
    } catch (error) {
      console.error('Error saving default store:', error);
    }
  }

  // Public method to manually refresh store list (can be called from other components)
  public forceRefreshStores() {
    this.loadStores();
  }

  private loadDefaultStore() {
    try {
      const defaultStoreData = localStorage.getItem(this.DEFAULT_STORE_KEY);
      if (defaultStoreData) {
        this.defaultStore = JSON.parse(defaultStoreData);
      }
    } catch (error) {
      console.error('Error loading default store:', error);
      localStorage.removeItem(this.DEFAULT_STORE_KEY);
    }
  }

  private loadSelectedStore() {
    try {
      const selectedStoreData = localStorage.getItem(this.SELECTED_STORE_KEY);
      if (selectedStoreData) {
        const parsedStore = JSON.parse(selectedStoreData);
        // Don't set selectedStore yet, wait for store list to load first
        // This will be used in autoSelectStore method
        console.log('Found previously selected store:', parsedStore.name);
      }
    } catch (error) {
      console.error('Error loading selected store:', error);
      localStorage.removeItem(this.SELECTED_STORE_KEY);
    }
  }

  private saveSelectedStore(store: Store) {
    try {
      localStorage.setItem(this.SELECTED_STORE_KEY, JSON.stringify({
        _id: store._id,
        name: store.name,
        code: store.code,
        status: store.status
      }));
      console.log('Saved selected store:', store.name);
    } catch (error) {
      console.error('Error saving selected store:', error);
    }
  }

  private setSelectedStoreWithoutSaving(store: Store) {
    this.selectedStore = store;
    
    // Update app state with selected store
    appState.setStore({
      _id: store._id!,
      name: store.name,
      code: store.code || '',
      status: store.status,
      createdBy: store.createdBy || ''
    });
    
    // Update storeID for backward compatibility
    this.storeID = store._id || '';
  }

  private autoSelectStore() {
    let storeToSelect: Store | null = null;
    
    // First priority: previously selected store from localStorage
    try {
      const selectedStoreData = localStorage.getItem(this.SELECTED_STORE_KEY);
      if (selectedStoreData) {
        const parsedStore = JSON.parse(selectedStoreData);
        storeToSelect = this.stores.find(store => store._id === parsedStore._id) || null;
        if (storeToSelect) {
          console.log('Restoring previously selected store:', storeToSelect.name);
        }
      }
    } catch (error) {
      console.error('Error reading selected store from localStorage:', error);
    }
    
    // Second priority: current store from app state
    if (!storeToSelect && appState.store) {
      storeToSelect = this.stores.find(store => store._id === appState.store!._id) || null;
      if (storeToSelect) {
        console.log('Using store from app state:', storeToSelect.name);
      }
    }
    
    // Third priority: default store if it exists in the list
    if (!storeToSelect && this.defaultStore) {
      storeToSelect = this.stores.find(store => store._id === this.defaultStore!._id) || null;
      if (storeToSelect) {
        console.log('Using default store:', storeToSelect.name);
      }
    }
    
    // Fourth priority: first active store
    if (!storeToSelect) {
      storeToSelect = this.stores.find(store => store.status === 'active') || null;
      if (storeToSelect) {
        console.log('Using first active store:', storeToSelect.name);
      }
    }
    
    // Last priority: first store in the list
    if (!storeToSelect && this.stores.length > 0) {
      storeToSelect = this.stores[0];
      if (storeToSelect) {
        console.log('Using first available store:', storeToSelect.name);
      }
    }
    
    if (storeToSelect) {
      // Use a different method to avoid saving the same store again during auto-selection
      this.setSelectedStoreWithoutSaving(storeToSelect);
    }
  }

  private setupStoreChangeSubscription() {
    // Subscribe to store list changes (create, update, delete)
    this.storeChangeSubscription = this.storeService.storeListChanged$.subscribe(() => {
      console.log('Store list changed, refreshing...');
      this.refreshStoreList();
    });
  }

  private refreshStoreList() {
    // Refresh the store list without showing loading state if dropdown is closed
    const showLoading = this.isStoreDropdownOpen;
    
    if (showLoading) {
      this.loadingStores = true;
    }
    
    this.storeError = null;
    
    this.storeService.getAllStores(1, 100).subscribe({
      next: (response) => {
        const previousStoreCount = this.stores.length;
        this.stores = response.items || [];
        
        if (showLoading) {
          this.loadingStores = false;
        }
        
        // If a new store was added and we didn't have a selected store, auto-select
        if (previousStoreCount === 0 && this.stores.length > 0 && !this.selectedStore) {
          this.autoSelectStore();
        }
        
        // If the currently selected store was deleted, select a new one
        if (this.selectedStore && !this.stores.find(store => store._id === this.selectedStore!._id)) {
          this.selectedStore = null;
          if (this.stores.length > 0) {
            this.autoSelectStore();
          }
        }
        
        console.log(`Store list refreshed: ${this.stores.length} stores available`);
      },
      error: (error) => {
        console.error('Error refreshing store list:', error);
        if (showLoading) {
          this.storeError = 'Failed to refresh stores';
          this.loadingStores = false;
        }
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const userMenuButton = document.querySelector('.user-menu-button');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');
    const storeDropdownButton = document.querySelector('.store-dropdown-button');
    const storeDropdownMenu = document.querySelector('.store-dropdown-menu');
    
    // Handle user menu clicks
    if (userMenuButton && userMenuDropdown) {
      if (!userMenuButton.contains(target) && !userMenuDropdown.contains(target)) {
        this.isUserMenuOpen = false;
      }
    }
    
    // Handle store dropdown clicks
    if (storeDropdownButton && storeDropdownMenu) {
      if (!storeDropdownButton.contains(target) && !storeDropdownMenu.contains(target)) {
        this.isStoreDropdownOpen = false;
      }
    }
  }
}

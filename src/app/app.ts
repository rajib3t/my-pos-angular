import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { TitleService } from './services/title.service';
import { StoreService } from './services/store.service';
import { appState } from "../app/state/app.state";
import './utils/debug-state'; // Import debug utilities
import { UiService } from './services/ui.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('my-pos');
  private userSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storeService: StoreService,
    private titleService: TitleService,
    private uiService: UiService
  ) {
    // Make this component available for debugging
    (window as any).appComponent = this;
  }

  ngOnInit() {
    // Initialize authentication and fetch user data on app startup
    this.initializeApp();
    
    // Initialize title service (automatic title updates based on routes)
    // The title service will handle title changes automatically
  }

  private initializeApp() {
    
    this.apiService.initializeAuth().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          
          
          // First, fetch fresh user profile data
          this.userService.fetchProfileData();
          
          // Subscribe to user changes and sync with app state
          this.userSubscription = this.userService.getAuthUser.subscribe(user => {
           
            if (user) {
              appState.setUser({
                id: user.id || '',
                name: user.name || '',
                email: user.email || '',
                role: user.role || ''
              });
              
              if(this.uiService.isSubDomain()){
                 this.checkAndSetStore();
              }
              // Fetch store data after user is set
             
            } else {
              appState.setUser(null);
            }
          });
        } else {
          // Clear app state if not authenticated
          appState.reset();
        }
      },
      error: (error) => {
        console.error('App: Authentication initialization failed:', error);
        appState.reset();
      }
    });
  }



  public checkAndSetStore() {
    // If a store is already present in state, do not fetch or set again
    if (appState.store && appState.store._id) {
      console.log('App: Store already set in state, skipping fetch.');
      return;
    }
    console.log('App: Fetching store data...');
    appState.setLoading(true);
    
    this.storeService.getAllStores(1, 1).subscribe({
      next: (response) => {
        
        if (response?.items?.length > 0) {
          const store = response.items[0];
          
          // Ensure all required fields are present
          if (store._id) {
            const storeData = {
              _id: store._id,
              name: store.name || '',
              code: store.code || '',
              status: (store.status as 'active' | 'inactive') || 'active',
              createdBy: store.createdBy || ''
            };
           
            // Only set if not already present
            if (!appState.store || !appState.store._id) {
              appState.setStore(storeData);
            }
          } else {
            console.warn('App: Store found but missing _id:', store);
          }
        } else {
          console.warn('App: No stores found in response:', response);
        }
        appState.setLoading(false);
      },
      error: (error) => {
        console.error('App: Store check failed:', error);
        appState.setLoading(false);
        // Don't clear store on error, keep existing data if any
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}

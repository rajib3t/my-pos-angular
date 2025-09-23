import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { TitleService } from './services/title.service';
import { StoreService } from './services/store.service';
import { appState } from "../app/state/app.state"
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('my-pos');

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private storeService: StoreService,
    private titleService: TitleService,
  ) {}

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
          // If authenticated, fetch fresh user profile data
         
          this.userService.fetchProfileData();
           this.checkAndSetStore();
        }
      },
      error: (error) => {
        console.error('App: Authentication initialization failed:', error);
      }
    });
  }



  private checkAndSetStore() {
    this.storeService.getAllStores(1, 1).subscribe({
      next: (response) => {
        if (response?.items?.length > 0) {
          const store = response.items[0];
          // Ensure all required fields are present
          if (store._id) {
            appState.setStore({
              _id: store._id,
              name: store.name,
              code: store.code || '', // Provide default value for optional field
              status: 'active', // Provide default status
              createdBy: '' // You might need to get this from the store or user context
            });
          }
        }
      },
      error: (error) => {
        console.error('App: Store check failed:', error);
      }
    });
  }
}

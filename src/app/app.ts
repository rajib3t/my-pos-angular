import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { TitleService } from './services/title.service';

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
    private titleService: TitleService
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
        }
      },
      error: (error) => {
        console.error('App: Authentication initialization failed:', error);
      }
    });
  }
}

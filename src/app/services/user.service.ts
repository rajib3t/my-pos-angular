import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

@Injectable({
  providedIn: 'root'
})


export class UserService {
  private authUserData = new BehaviorSubject<User | null>(this.getStoredUser());
  private readonly USER_STORAGE_KEY = 'authUser';
  private profileData = new BehaviorSubject<User | null>(null);
  constructor(private apiService: ApiService) { }
  private getStoredUser(): User | null {
      try {
        const userData = localStorage.getItem(this.USER_STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem(this.USER_STORAGE_KEY);
        return null;
      }
    }

  private storeUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  setAuthUser(user: User): User {
    this.storeUser(user);
    this.authUserData.next(user);
    return user;
  }



  get authUser(): Observable<User | null> {
    return this.authUserData.asObservable();
  }

  public fetchProfileData(): void {
    console.log('Fetching profile data...');
    this.apiService.protectedGet <{ data: User }>('profile').subscribe({
      next: (response) => {
        console.log('Profile data response:', response);
        this.profileData.next(response.data.data);
      },
      error: (error) => {
        console.error('Error fetching profile data:', error);
        // If it's a 401 error, the interceptor should handle token refresh
        if (error.status === 401) {
          console.log('Profile fetch failed due to authentication, token refresh should be triggered');
        }
      }
    });
  }

  get profileUserData(): Observable<User | null> {
    return this.profileData.asObservable();
  }

  /**
   * Clear user data (logout)
   */
  public clearUserData(): void {
    console.log('Clearing user data...');
    this.storeUser(null);
    this.authUserData.next(null);
    this.profileData.next(null);
  }
}

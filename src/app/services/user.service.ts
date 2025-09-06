import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

export interface ProfileData extends User {
  mobile?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface Password {
  [key: string]: string;
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


  get getAuthUser():  Observable<ProfileData | null>{
    //return this.authUserData.pipe()
    return this.authUserData.asObservable();
  }
  get authUser(): Observable<ProfileData | null> {
    return this.authUserData.asObservable();
  }

  public fetchProfileData(): void {
    
    this.apiService.protectedGet <{ data: ProfileData }>('profile').subscribe({
      next: (response) => {
        
        const userData = response.data.data;
        this.profileData.next(userData);
        // Also update the auth user data with fresh profile data
        this.setAuthUser(userData);
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

  get profileUserData(): Observable<ProfileData | null> {
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



  public updateProfileData(updatedData: Partial<ProfileData>): Observable<ProfileData> {
    return new Observable<ProfileData>((observer) => {
      this.apiService.protectedPatch<{ data: ProfileData }>('profile', updatedData).subscribe({
        next: (response) => {
          const updatedUser = response.data.data;
          // Update both profile and auth user data
          this.profileData.next(updatedUser);
          this.setAuthUser(updatedUser);
          observer.next(updatedUser);
          observer.complete();
        },
        error: (error) => {
          console.error('Error updating profile data:', error);
          observer.error(error);
        }
      });
    });
  }

  public updatePassword(currentPassword: string, newPassword: string): Observable<Password> {
    return new Observable<Password>((observer) => {
      this.apiService.protectedPatch<{ message: string }>('profile/password', { currentPassword, newPassword }).subscribe({
        next: (response) => {
          observer.next({ message: 'Password updated successfully' });
          observer.complete();
        },
        error: (error) => {
          console.error('Error updating password:', error);
          observer.error(error);
        }
      });
    });
  }
}

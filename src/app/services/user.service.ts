import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id?: string;
  email: string;
  name: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  mobile?: string;
  // Add other user properties as needed
}

export interface User {
  id?: string;
  email: string;
  name: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  mobile?: string;
  // Add other user properties as needed
}



export interface UserList {
  items: {
    _id: string;
    name: string;
    email: string;
    role: string;
    mobile:string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  limit: number;
}

export interface ProfileData extends User {
  
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
  /**
   * Reset a user's password (admin action)
   * @param userId The id of the user to reset
   * @returns Observable<{ message: string }>
   */
  resetUserPassword(userId: string, tenantId?: string): Observable<{ message: string }> {
    return new Observable<{ message: string }>((observer) => {
      let url = '';
      if (tenantId) {
        url = `tenant/${tenantId}/users/${userId}/reset-password`;
      } else {
        url = `users/${userId}/reset-password`;
      }
      this.apiService.protectedPost<{ message: string }>(url, {}).subscribe({
        next: (response) => {
          observer.next({ message: response.data.message });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
  private userData = new BehaviorSubject<User | null>(null);
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


    getUsers ( page: number = 1, limit: number = 10, filter?: { [key: string]: any }, tenantId?: string): Observable<UserList> {
    return new Observable<UserList>((observer) => {
      // Build query parameters
      let queryParams = `page=${page}&limit=${limit}&timezone=-330`;
      if (filter) {
        Object.keys(filter).forEach(key => {
          if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
            queryParams += `&${key}=${encodeURIComponent(filter[key])}`;
          }
        });
      }
      let url = '';
      if(tenantId){
        url = `tenant/${tenantId}/users?${queryParams}`;
      }else{
        url = `users?${queryParams}`;
      }
      

      this.apiService.protectedGet<{ data: any }>(url).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  createUser( user: Partial<User> & { password: string }, tenantId?: string): Observable<User> {
    return new Observable<User>((observer) => {
      let url = '';
      if(tenantId){
        url = `tenant/${tenantId}/users`;
      }else{
        url = `users`;
      }
      this.apiService.protectedPost<{ data: User }>(url, user).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }


 

  getUser(userId: string, tenantId?: string): Observable<User | null> {
    return new Observable<User | null>((observer) => {
      let url = '';
      if (tenantId) {
        url = `tenant/${tenantId}/users/${userId}`;
      } else {
        url = `users/${userId}`;
      }

      this.apiService.protectedGet<{ data: User }>(url).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  updateUser(userId: string, updatedData: Partial<ProfileData>, tenantId?: string): Observable<ProfileData> {
    return new Observable<ProfileData>((observer) => {
      let url = '';
      if (tenantId) {
        url = `tenant/${tenantId}/users/${userId}`;
      } else {
        url = `users/${userId}`;
      }

      this.apiService.protectedPatch<{ data: User }>(url, updatedData).subscribe({
        next: (response) => {
          observer.next(response.data.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  deleteUser(userId: string, tenantId?: string): Observable<{ message: string }> {
    return new Observable<{ message: string }>((observer) => {
      let url = '';
      if (tenantId) {
        url = `tenant/${tenantId}/users/${userId}`;
      } else {
        url = `users/${userId}`;
      }

      this.apiService.protectedDelete<{ message: string }>(url).subscribe({
        next: (response) => {
          observer.next({ message: response.data.message });
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }


  resetPassword(userId: string, newPassword: string, tenantId?: string): Observable<void> {
    return new Observable<void>((observer) => {
      let url = '';
      if (tenantId) {
        url = `tenant/${tenantId}/users/${userId}/reset-password`;
      } else {
        url = `users/${userId}/reset-password`;
      }
      
      this.apiService.protectedPatch<{ message: string }>(url, { newPassword }).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  
}

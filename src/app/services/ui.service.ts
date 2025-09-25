import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications = this.notifications$.asObservable();
  

  constructor(
    private apiService: ApiService
  ) { }

  isMobileMenuOpen =  new BehaviorSubject<boolean | null>(false);
  isUserMenuOpen = false;
  setOpenMobileMenu(isOpen: boolean) : boolean {
    // Logic to open/close mobile menu
    if (isOpen) {
      this.isMobileMenuOpen.next(true);
      return true;
    } else {
      this.isMobileMenuOpen.next(false);
      return false;
    }
  }

  getOpenMobileMenu() : boolean {
    // Logic to get the current state of mobile menu
    return this.isMobileMenuOpen.value || false;
  }


  getDomain() : string {
    //return 'lead.mypos.test';
    return window.location.hostname;
  }

  getSubDomain() : string {
    const hostParts = this.getDomain().split('.');
    if (hostParts.length > 2) {
      return hostParts[0]; // Return the subdomain part
    }
    return ''; // No subdomain
  }

  isSubDomain() : boolean {
    const hostParts = this.getDomain().split('.');
    return hostParts.length > 2;
  }

  // Notification methods
  showNotification(notification: Omit<Notification, 'id'>): void {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      dismissible: true,
      ...notification
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, newNotification]);

    // Auto-dismiss if duration is set
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.dismissNotification(id);
      }, newNotification.duration);
    }
  }

  success(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: 'success',
      message,
      title,
      duration
    });
  }

  error(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: 'error',
      message,
      title,
      duration: duration || 8000 // Errors stay longer by default
    });
  }

  warning(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: 'warning',
      message,
      title,
      duration
    });
  }

  info(message: string, title?: string, duration?: number): void {
    this.showNotification({
      type: 'info',
      message,
      title,
      duration
    });
  }

  dismissNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  clearAllNotifications(): void {
    this.notifications$.next([]);
  }


getSubAccount(subdomain: string): Observable<{data:{_id: string, name: string, subdomain: string}}> {
    return new Observable<{data:{_id: string, name: string, subdomain: string}}>((observer) => {
      this.apiService.get<{data:{_id: string, name: string, subdomain: string}}>(`subdomain/${subdomain}`).subscribe({
        next: (response) => {
          observer.next(response.data);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Check if subdomain is available for registration
   * Returns success if subdomain is available (404), error if taken (200)
   */
  checkSubdomainAvailability(subdomain: string): Observable<{available: boolean, message: string}> {
    return new Observable<{available: boolean, message: string}>((observer) => {
      this.apiService.get<{data:{_id: string, name: string, subdomain: string}}>(`subdomain/${subdomain}`).subscribe({
        next: (response) => {
          // If we get a successful response, subdomain exists and is NOT available
          observer.next({
            available: false,
            message: `Subdomain Not Available\nThe subdomain ${subdomain} is not available.\nThis subdomain account is not available`
          });
          observer.complete();
        },
        error: (error) => {
          if (error.status === 404) {
            // 404 means subdomain doesn't exist, so it's available
            observer.next({
              available: true,
              message: `Subdomain ${subdomain} is available`
            });
          } else {
            // Other errors
            observer.next({
              available: false,
              message: `Error checking subdomain availability: ${error.message || 'Unknown error'}`
            });
          }
          observer.complete();
        }
      });
    });
  }

  /**
   * Check subdomain availability and show notification
   */
  checkAndNotifySubdomainAvailability(subdomain: string): void {
    this.checkSubdomainAvailability(subdomain).subscribe({
      next: (result) => {
        if (result.available) {
          this.success(result.message, 'Subdomain Available');
        } else {
          this.error(result.message, 'Subdomain Not Available');
        }
      },
      error: (error) => {
        this.error('Failed to check subdomain availability', 'Error');
      }
    });
  }

  


  
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  

  constructor() { }

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


  
}
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService, Notification } from '../../../services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngFor="let notification of notifications" 
         [ngClass]="{
           'bg-green-100 border-green-500 text-green-700': notification.type === 'success',
           'bg-red-100 border-red-500 text-red-700': notification.type === 'error',
           'bg-yellow-100 border-yellow-500 text-yellow-700': notification.type === 'warning',
           'bg-blue-100 border-blue-500 text-blue-700': notification.type === 'info'
         }"
         class="fixed top-4 right-4 max-w-sm w-full shadow-lg rounded-lg p-4 mb-4 border-l-4 z-50 transition-all duration-300 ease-in-out">
      <div class="flex justify-between items-center">
        <div class="flex-1">
          <p *ngIf="notification.title" class="font-bold">{{ notification.title }}</p>
          <p>{{ notification.message }}</p>
        </div>
        <button *ngIf="notification.dismissible" 
                (click)="dismiss(notification.id!)"
                class="ml-4 text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NotificationComponent implements OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription;

  constructor(private uiService: UiService) {
    this.subscription = this.uiService.notifications.subscribe(
      notifications => this.notifications = notifications
    );
  }

  dismiss(id: string) {
    this.uiService.dismissNotification(id);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

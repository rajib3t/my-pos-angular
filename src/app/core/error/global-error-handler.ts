import { ErrorHandler, Injectable, inject } from '@angular/core';
import { appState } from '../../state/app.state';
import { UiService } from '../../services/ui.service';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {
  private uiService = inject(UiService);

  handleError(error: any): void {
    console.error('GlobalErrorHandler:', error);
    
    let errorMessage = 'An unexpected error occurred.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Update app state
    appState.setError(errorMessage);
    
    // Show error notification
    this.uiService.showNotification({
      type: 'error',
      message: errorMessage,
      duration: 5000
    });
  }
}

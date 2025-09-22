import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { appState } from '../../../state/app.state';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" style="background-color: rgba(107, 114, 128, 0.75);">
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto opacity-20" ></div>
          <p class="mt-4 text-center">Loading...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingComponent {
  get isLoading() {
    return appState.loading;
  }
}

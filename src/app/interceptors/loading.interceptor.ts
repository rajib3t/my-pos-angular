import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { appState } from '../state/app.state';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip for specific endpoints if needed
    const endpointsToSkip = [
      'profile',
      'another-endpoint-to-skip',
      'yet-another-endpoint'
    ];

    if (endpointsToSkip.some(endpoint => request.url.includes(endpoint))) {
      return next.handle(request);
    }

    // Set loading to true
    appState.setLoading(true);

    return next.handle(request).pipe(
      finalize(() => {
        // Set loading to false when the request completes
        appState.setLoading(false);
      })
    );
  }
}

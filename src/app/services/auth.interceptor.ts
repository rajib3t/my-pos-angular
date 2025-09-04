import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiService } from './api.service';
import { catchError, switchMap } from 'rxjs/operators';

const jwtHelper = new JwtHelperService();

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  console.log('AuthInterceptor: Processing request to:', req.url);
  
  // Inject ApiService at the top level of the interceptor function
  const apiService = inject(ApiService);
  
  // Don't modify headers for authentication endpoints
  if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
    console.log('AuthInterceptor: Skipping auth endpoints');
    return next(req);
  }

  // Always set basic headers for all requests
  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Client-URL', window.location.origin);

  // Determine if this is a protected request
  const isProtected = req.headers.has('X-Is-Protected') || 
                     req.url.includes('/protected') || 
                     req.url.includes('/api/') ||
                     req.method !== 'GET'; // Protect all non-GET requests by default

  if (isProtected) {
    const token = localStorage.getItem('authToken');
    console.log("AuthInterceptor: Processing protected request with token:", token ? 'present' : 'missing');
    
    if (token) {
      try {
        // Check if token is expired
        const isTokenExpired = jwtHelper.isTokenExpired(token);
        if (isTokenExpired) {
          console.log("AuthInterceptor: Token is expired, will attempt refresh on 401");
        }
        
        const decodedToken = jwtHelper.decodeToken(token);
        if (decodedToken && decodedToken.userId) {
          headers = headers.set('X-User-ID', decodedToken.userId);
        }
        headers = headers.set('Authorization', `Bearer ${token}`);
      } catch (error) {
        console.error('AuthInterceptor: Error decoding token for headers:', error);
      }
    } else {
      console.log("AuthInterceptor: No token found for protected request");
    }
  }

  const clonedReq = req.clone({ headers });
  
  return next(clonedReq).pipe(
    catchError(error => {
      console.log("AuthInterceptor: Request failed with status:", error.status);
      
      if (error.status === 401 && isProtected) {
        console.log("AuthInterceptor: 401 error on protected request, attempting token refresh");
        
        return apiService.refreshToken().pipe(
          switchMap((response) => {
            console.log("AuthInterceptor: Token refresh successful", response)
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;
            
            if (newAccessToken) {
              localStorage.setItem('authToken', newAccessToken);
            }
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken.token);
            }
            
            // Retry original request with new token
            const retryHeaders = headers.set('Authorization', `Bearer ${newAccessToken}`);
            const retryReq = req.clone({ headers: retryHeaders });
            return next(retryReq);
          }),
          catchError(refreshError => {
            console.error("AuthInterceptor: Token refresh failed:", refreshError);
            // Clear invalid tokens and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            // You might want to inject Router and navigate to login here
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

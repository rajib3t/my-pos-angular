import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiService } from './api.service';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private jwtHelper = new JwtHelperService();
  private apiService: ApiService;

  constructor(private injector: Injector) {
    this.apiService = this.injector.get(ApiService);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(req);
    
    // Don't modify headers for certain requests (like login, refresh token)
    if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
      return next.handle(req);
    }


    let headers = req.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('X-Client-URL', window.location.origin);

    // Check if request is protected (custom logic, e.g., URL contains /protected or use a custom header)
    const isProtected = req.headers.has('X-Is-Protected') || req.url.includes('/protected') || req.url.includes('/api/');
    
    if (isProtected) {
      const token = localStorage.getItem('authToken');
      console.log("AuthInterceptor: Processing protected request with token:", token ? 'present' : 'missing');
      
      if (token) {
        try {
          // Check if token is expired
          const isTokenExpired = this.jwtHelper.isTokenExpired(token);
          if (isTokenExpired) {
            console.log("AuthInterceptor: Token is expired, will attempt refresh on 401");
          }
          
          const decodedToken = this.jwtHelper.decodeToken(token);
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
    return next.handle(clonedReq).pipe(
      catchError(error => {
        console.log("AuthInterceptor: Request failed with status:", error.status);
        
        if (error.status === 401 && isProtected) {
          console.log("AuthInterceptor: 401 error on protected request, attempting token refresh");
          
          return this.apiService.refreshToken().pipe(
            switchMap((response) => {
              console.log("AuthInterceptor: Token refresh successful");
              const newAccessToken = response.data.accessToken;
              const newRefreshToken = response.data.refreshToken;
              
              if (newAccessToken) {
                localStorage.setItem('authToken', newAccessToken);
              }
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              
              // Retry original request with new token
              const retryHeaders = headers.set('Authorization', `Bearer ${newAccessToken}`);
              const retryReq = req.clone({ headers: retryHeaders });
              return next.handle(retryReq);
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
  }
}

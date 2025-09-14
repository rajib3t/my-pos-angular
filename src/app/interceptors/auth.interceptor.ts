import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpClient
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UiService } from '../services/ui.service';
const jwtHelper = new JwtHelperService();

// Helper function to get appropriate error message
const getErrorMessage = (error: any): string => {
  if (error.status === 0) {
    return 'Network error. Please check your connection.';
  } else if (error.status >= 500) {
    return 'Server error. Please try again later.';
  } else if (error.status === 404) {
    return 'Resource not found.';
  } else if (error.status === 403) {
    return 'Access denied.';
  } else if (error.status === 400 || error.status === 406 || error.status === 422 ) {
    // For client errors, preserve the server message
    return error.error?.message || 'Bad request.';

  }else if(error.status === 409) {
    return  error.error?.message || 'Conflict error. Resource already exists.';
  } else if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  } else {
    return error.error?.message || 'An error occurred. Please try again.';
  }
};

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  
  
  // Inject HttpClient directly to avoid circular dependency with ApiService
  const http = inject(HttpClient);
  const uiService = inject(UiService);
  // Don't modify headers for authentication endpoints
  if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
    console.log('AuthInterceptor: Skipping auth endpoints');
    let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Client-URL', uiService.getDomain());
    

    if (uiService.isSubDomain()) {
      headers = headers.set('X-tenant-subdomain', uiService.getSubDomain());
    }
    const modifiedReq = req.clone({ headers });
    return next(modifiedReq);
  }

  

  // Always set basic headers for all requests
  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('X-Client-URL', uiService.getDomain());
    

    if (uiService.isSubDomain()) {
      headers = headers.set('X-tenant-subdomain', uiService.getSubDomain());
    }
  // Determine if this is a protected request
  const isProtected = req.headers.has('X-Is-Protected') || 
                     req.url.includes('/protected') || 
                     req.url.includes('/api/') ||
                     req.method !== 'GET'; // Protect all non-GET requests by default

  if (isProtected) {
    const token = localStorage.getItem('authToken');
    
    
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
      
      // Only handle 401 errors for token refresh, let other errors pass through
      if (error.status === 401 && isProtected) {
        console.log("AuthInterceptor: 401 error on protected request, attempting token refresh");
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log("AuthInterceptor: No refresh token available");
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          const standardizedError = {
            status: 401,
            error: {
              success: false,
              message: 'Authentication failed. Please login again.',
              data: null,
              error: 'No refresh token available'
            }
          };
          return throwError(() => standardizedError);
        }
        
        // Make direct HTTP call to refresh endpoint to avoid circular dependency
        const refreshUrl = `${environment.apiUrl}/auth/refresh`;

        let refreshHeaders: { [key: string]: string } = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
       if( uiService.isSubDomain()) {
        refreshHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-tenant-subdomain': uiService.getSubDomain() as string,
        };
       }

        const refreshOptions = {
          headers: refreshHeaders,
          withCredentials: true
        };
        return http.post<any>(refreshUrl, { refreshToken }, refreshOptions).pipe(
          switchMap((response) => {
            console.log("AuthInterceptor: Token refresh successful", response);
            
            // Access the response data correctly based on your API structure
            const newAccessToken = response.data?.accessToken;
            const newRefreshToken = response.data?.refreshToken?.token;
            
            if (!newAccessToken) {
              console.error("AuthInterceptor: No access token in refresh response");
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              const standardizedError = {
                status: 401,
                error: {
                  success: false,
                  message: 'Authentication failed. Please login again.',
                  data: null,
                  error: 'Invalid refresh response'
                }
              };
              return throwError(() => standardizedError);
            }
            
            localStorage.setItem('authToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
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
            // Return standardized error response
            const standardizedError = {
              status: refreshError.status || 401,
              error: {
                success: false,
                message: 'Authentication failed. Please login again.',
                data: null,
                error: refreshError.error || 'Token refresh failed'
              }
            };
            return throwError(() => standardizedError);
          })
        );
      }


       if(error.error.message == 'Validation failed'){
        // Parse validation errors and create field-specific error messages
        const validationErrors: { [key: string]: string } = {};
        
        if (error.error.error && Array.isArray(error.error.error)) {
          error.error.error.forEach((errorMessage: string) => {
            // Split by colon to get field name and error message
            const colonIndex = errorMessage.indexOf(':');
            if (colonIndex !== -1) {
              const fieldName = errorMessage.substring(0, colonIndex).trim();
              const fieldError = errorMessage.substring(colonIndex + 1).trim();
              validationErrors[fieldName] = fieldError;
            }
          });
        }
        
        const standardizedError = {
          status: error.status || 0,
          error: {
            success: false,
            message: 'Validation failed',
            data: null,
            error: 'Validation Error',
            validationErrors: validationErrors
          }
        };
        console.log('ApiService: Handling validation errors:', standardizedError);
        return throwError(() => standardizedError);
      }
      
      // For non-401 errors, preserve the original error structure and message
      const standardizedError = {
        status: error.status || 0,
        error: {
          success: false,
          message: getErrorMessage(error),
          data: null,
          error: error.error || error.message || 'An unexpected error occurred'
        }
      };
      
      console.error("AuthInterceptor: Standardized error response:", standardizedError);
      return throwError(() => standardizedError);
    })
  );
};

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiResponse, ParsedCookie, AuthToken } from './api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;
  private authToken$ = new BehaviorSubject<string | null>(null);
  private refreshToken$ = new BehaviorSubject<string | null>(null);


  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
  }



  private makeRequest<T>(method: string, endpoint: string, body?: any, isProtected: boolean = false, options?: any): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.createHeaders(isProtected);
    const requestOptions = {
      headers,
      observe: 'response' as 'response',
      withCredentials: true,
      ...options
    };
    let request$: Observable<HttpEvent<T>>;
    switch (method.toLowerCase()) {
      case 'get':
        request$ = this.http.get<T>(url, requestOptions);
        break;
      case 'post':
        request$ = this.http.post<T>(url, body, requestOptions);
        break;
      case 'put':
        request$ = this.http.put<T>(url, body, requestOptions);
        break;
      case 'patch':
        request$ = this.http.patch<T>(url, body, requestOptions);
        break;
      case 'delete':
        request$ = this.http.delete<T>(url, requestOptions);
        break;
      default:
        return throwError(() => new Error(`Unsupported request method: ${method}`));
    }
    return request$.pipe(
      filter((event): event is HttpResponse<T> => event.type === HttpEventType.Response),
      map(response => this.handleResponse<T>(response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // If the error is already standardized by the auth interceptor, pass it through
    if (error && error.error && typeof error.error === 'object' && 'success' in error.error) {
      console.log('ApiService: Passing through standardized error from interceptor:', error);
      return throwError(() => error);
    }
    
    // Handle raw HttpErrorResponse (fallback for non-intercepted errors)
    if (error instanceof HttpErrorResponse) {
      const standardizedError = {
        status: error.status || 0,
        error: {
          success: false,
          message: error.error?.message || error.message || 'An unknown error occurred!',
          data: null,
          error: error.error || error.message || 'HTTP Error'
        }
      };
      console.log('ApiService: Standardizing raw HttpErrorResponse:', standardizedError);
      return throwError(() => standardizedError);
    }
    
    // Handle other error types
    const standardizedError = {
      status: 0,
      error: {
        success: false,
        message: error?.message || 'An unknown error occurred!',
        data: null,
        error: error || 'Unknown Error'
      }
    };
    console.log('ApiService: Standardizing unknown error type:', standardizedError);
    return throwError(() => standardizedError);
  }

  // Headers creation methods
  private createHeaders(isProtected: boolean = false): HttpHeaders {
    // Let the interceptor handle all headers including Content-Type, Accept, etc.
    let headers = new HttpHeaders();
    
    if (isProtected) {
      headers = headers.set('X-Is-Protected', 'true');
    }
    
    return headers;
  }
// Unified API methods
  public get<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, false, options);
  }

  public post<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, false, options);
  }

  public put<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, false, options);
  }

  public patch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, false, options);
  }

  public delete<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, false, options);
  }

  public protectedGet<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, true, options);
  }

  public protectedPost<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, true, options);
  }

  public protectedPut<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, true, options);
  }

  public protectedPatch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, data, true, options);
  }

  public protectedDelete<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, true, options);
  }

  /**
   * Calls the refresh token endpoint and returns the new tokens.
   * This method bypasses the auth interceptor by not setting the protected header
   * @returns Observable<ApiResponse<{ accessToken: string; refreshToken: string }>>
   */
  public refreshToken(): Observable<ApiResponse<{ data:{accessToken: string; refreshToken: {token:string, expiresIn:string}} }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Use the basic post method without protection to avoid interceptor issues
    return this.post<{ data:{accessToken: string; refreshToken: {token:string, expiresIn:string}} }>(
      'auth/refresh',
      { refreshToken }
    );
  }

  // Utility: get stored token (implement as needed)
  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Utility: handle API response
  private handleResponse<T>(response: HttpResponse<T>): ApiResponse<T> {
    return {
      data: response.body as T,
      status: response.status,
      headers: response.headers
    };
  }

  private decodeJWT(token: string): AuthToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }

    try {
      const decodedToken = this.decodeJWT(token);
      if (!decodedToken) {
        return false;
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }


   // Auth token management
  public setAuthToken(token: string): void {
    this.authToken$.next(token);
    localStorage.setItem('authToken', token);
    //this.setCookie('authToken', token, ['path=/']);
  }

  public setRefreshToken(refreshToken: string): void {
    this.refreshToken$.next(refreshToken);
    localStorage.setItem('refreshToken', refreshToken);
    //this.setCookie('refreshToken', refreshToken, ['path=/']);
  }

  /**
   * Clear all authentication data (logout)
   */
  public clearAuthData(): void {
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.setCookie("accessToken", "", ["expires=Thu, 01 Jan 1970 00:00:00 GMT", "path=/"]);
    this.setCookie("refreshToken", "", ["expires=Thu, 01 Jan 1970 00:00:00 GMT", "path=/"]);
  
    this.authToken$.next(null);
    this.refreshToken$.next(null);
  }

  private setCookie(name: string, value: string, options: string[]): void {
    // Implementation for setting cookies
    document.cookie = `${name}=${value}; ${options.join('; ')}`;
  }

  /**
   * Initialize authentication on app startup
   * This method should be called when the app starts to check and refresh tokens if needed
   */
  public initializeAuth(): Observable<boolean> {
    return new Observable(observer => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        console.log('No auth token found, user needs to login');
        observer.next(false);
        observer.complete();
        return;
      }

      // Check if current token is valid
      if (this.isAuthenticated()) {
       
        observer.next(true);
        observer.complete();
        return;
      }

      // Token is expired, try to refresh
      if (refreshToken) {
        console.log('Token expired, attempting to refresh...');
        this.refreshToken().subscribe({
          next: (response) => {
            console.log('Token refresh successful');
            this.setAuthToken(response.data.data.accessToken);
            this.setRefreshToken(response.data.data.refreshToken.token);
            observer.next(true);
            observer.complete();
          },
          error: (error) => {
            console.error('Token refresh failed:', error);
            // Clean up invalid tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            observer.next(false);
            observer.complete();
          }
        });
      } else {
        console.log('No refresh token available, user needs to login');
        localStorage.removeItem('authToken');
        observer.next(false);
        observer.complete();
      }
    });
  }
}
  



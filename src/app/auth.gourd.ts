import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './services/api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private apiService: ApiService
    ) {}

    canActivate(): boolean | Observable<boolean> {
       
        
        try {
            // First check if we have a token and it's valid
            const hasValidToken = this.apiService.isAuthenticated();
            
            if (hasValidToken) {
               
                return true;
            }

           
            return this.apiService.initializeAuth().pipe(
                map(isAuthenticated => {
                    if (isAuthenticated) {
                       
                        return true;
                    } else {
                        
                        this.router.navigate(['/login']);
                        return false;
                    }
                }),
                catchError(error => {
                    console.error('AuthGuard: Error during authentication initialization:', error);
                    this.router.navigate(['/login']);
                    return of(false);
                })
            );
        } catch (error) {
            console.error('AuthGuard: Error during authentication check:', error);
            this.router.navigate(['/login']);
            return false;
        }
    }
}

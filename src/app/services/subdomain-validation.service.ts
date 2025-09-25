import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { UiService } from './ui.service';

export interface SubdomainAccount {
  _id: string;
  name: string;
  subdomain: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubdomainValidationService {
  private subdomainAccount$ = new BehaviorSubject<SubdomainAccount | null>(null);
  private validationCache = new Map<string, { account: SubdomainAccount | null, timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private uiService: UiService) {}

  /**
   * Get the current subdomain account
   */
  get currentSubdomainAccount(): Observable<SubdomainAccount | null> {
    return this.subdomainAccount$.asObservable();
  }

  /**
   * Validate if the current subdomain has a valid account
   */
  validateCurrentSubdomain(): Observable<{ isValid: boolean; account?: SubdomainAccount; error?: string }> {
    const subdomain = this.uiService.getSubDomain();
    
    if (!subdomain) {
      // No subdomain means main domain - this is valid
      return of({ isValid: true });
    }

    return this.validateSubdomain(subdomain);
  }

  /**
   * Validate a specific subdomain
   */
  validateSubdomain(subdomain: string): Observable<{ isValid: boolean; account?: SubdomainAccount; error?: string }> {
    if (!subdomain || subdomain.trim() === '') {
      return of({ isValid: false, error: 'Invalid subdomain' });
    }

    // Check cache first
    const cached = this.getCachedValidation(subdomain);
    if (cached) {
      const result = cached.account 
        ? { isValid: true, account: cached.account }
        : { isValid: false, error: 'Subdomain account not found' };
      
      if (cached.account) {
        this.subdomainAccount$.next(cached.account);
      }
      
      return of(result);
    }

    // Fetch from API
    return this.uiService.getSubAccount(subdomain).pipe(
      map((response: {data: SubdomainAccount}) => {
        // Extract the account data from the response
        const account = response.data;
       
        
        // Cache the successful result
        this.setCachedValidation(subdomain, account);
        this.subdomainAccount$.next(account);
        return { isValid: true, account };
      }),
      catchError((error) => {
        console.error('Subdomain validation error:', error);
        
        // Cache the failed result
        this.setCachedValidation(subdomain, null);
        this.subdomainAccount$.next(null);
        
        let errorMessage = 'Subdomain account not found';
        if (error.status === 404) {
          errorMessage = 'This subdomain does not exist or is not available';
        } else if (error.status === 403) {
          errorMessage = 'This subdomain account is not active';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later';
        }
        
        return of({ isValid: false, error: errorMessage });
      })
    );
  }

  /**
   * Check if current domain is a subdomain and if it's valid
   */
  isValidSubdomainAccess(): Observable<boolean> {
    return this.validateCurrentSubdomain().pipe(
      map(result => result.isValid)
    );
  }

  /**
   * Clear the subdomain account data
   */
  clearSubdomainAccount(): void {
    this.subdomainAccount$.next(null);
  }

  /**
   * Get cached validation result
   */
  private getCachedValidation(subdomain: string): { account: SubdomainAccount | null; timestamp: number } | null {
    const cached = this.validationCache.get(subdomain);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached;
    }
    
    // Remove expired cache
    if (cached) {
      this.validationCache.delete(subdomain);
    }
    
    return null;
  }

  /**
   * Set cached validation result
   */
  private setCachedValidation(subdomain: string, account: SubdomainAccount | null): void {
    this.validationCache.set(subdomain, {
      account,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached validations
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get subdomain info for display purposes
   */
  getSubdomainInfo(): { subdomain: string; isSubdomain: boolean } {
    const subdomain = this.uiService.getSubDomain();
    const isSubdomain = this.uiService.isSubDomain();
    
    return { subdomain, isSubdomain };
  }
}

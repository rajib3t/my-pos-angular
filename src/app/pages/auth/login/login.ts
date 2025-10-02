import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { AuthLayout } from '../../../shared/layout/auth/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ApiResponse  } from '../../../services/api-response.model';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { TitleService } from '../../../services/title.service';
import { UiService } from '../../../services/ui.service';
import { SubdomainValidationService } from '../../../services/subdomain-validation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { timer } from 'rxjs';
import { StoreService } from '@/app/services/store.service';
import { appState } from '@/app/state/app.state';
interface LoginResponseData {
  accessToken: string;
  refreshToken: {
    token: string;
    expiresIn: number;
  };
  user: any;
}

type LoginResponse = ApiResponse<LoginResponseData>;
@Component({
  selector: 'app-login',
  imports: [
    AuthLayout,
    CommonModule,
    ReactiveFormsModule,
  
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  isValidatingSubdomain = false;
  subdomainError = '';
  private destroyRef = inject(DestroyRef);
  showPassword = false;
  currentUrl = '';
  isSubdomain = false;
  subdomain = '';
  accountName = '';
  redirectUrl: string | null = null;
  
  constructor(
     private fb: FormBuilder,
     private apiService: ApiService,
     private router: Router,
     private userService: UserService,
     private titleService: TitleService,
     private uiService: UiService,
     private subdomainValidationService: SubdomainValidationService,
     private storeService:StoreService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // You can optionally set a custom title here
    this.titleService.setTitle('Sign In');
    
    // Set URL indication
    this.setUrlIndication();
    
    // Get redirect URL if exists
    this.redirectUrl = sessionStorage.getItem('redirectUrl');
    
    // Hydrate remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }

    // Validate subdomain on component initialization
    this.validateSubdomainOnInit();
  }

  private setUrlIndication(): void {
    this.currentUrl = window.location.hostname;
    this.isSubdomain = this.uiService.isSubDomain();
    this.subdomain = this.uiService.getSubDomain();
    
    // If subdomain exists, try to get account name
    if (this.isSubdomain && this.subdomain) {
      this.uiService.getSubAccount(this.subdomain)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            if (response?.data?.name) {
              this.accountName = response.data.name;
            }
          },
          error: (error) => {
            console.error('Failed to fetch account name:', error);
            // Keep subdomain as fallback
          }
        });
    }
  }

  private validateSubdomainOnInit(): void {
    const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
    
    // If it's a subdomain, validate it
    if (subdomainInfo.isSubdomain) {
      this.isValidatingSubdomain = true;
      this.subdomainValidationService.validateCurrentSubdomain()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            this.isValidatingSubdomain = false;
            if (!result.isValid) {
              // Redirect to subdomain error page
              this.router.navigate(['/subdomain-error']);
            }
          },
          error: (error) => {
            this.isValidatingSubdomain = false;
            console.error('Subdomain validation error:', error);
            // Redirect to subdomain error page on validation error
            this.router.navigate(['/subdomain-error']);
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // First validate subdomain if it's a subdomain
    const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
    
    if (subdomainInfo.isSubdomain) {
      this.validateSubdomainBeforeLogin();
    } else {
      this.performLogin();
    }
  }

  private validateSubdomainBeforeLogin(): void {
    this.isValidatingSubdomain = true;
    this.subdomainError = '';
    
    this.subdomainValidationService.validateCurrentSubdomain()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isValidatingSubdomain = false;
          if (result.isValid) {
            // Subdomain is valid, proceed with login
            this.performLogin();
          } else {
            // Subdomain is invalid, show error and redirect
            this.subdomainError = result.error || 'Subdomain account not available';
            setTimeout(() => {
              this.router.navigate(['/subdomain-error']);
            }, 2000);
          }
        },
        error: (error) => {
          this.isValidatingSubdomain = false;
          console.error('Subdomain validation error:', error);
          this.subdomainError = 'Unable to validate subdomain. Please try again.';
          setTimeout(() => {
            this.router.navigate(['/subdomain-error']);
          }, 2000);
        }
      });
  }

  private performLogin(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    
    this.apiService.post<LoginResponse>('auth/login', { email, password })
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.apiService.setAuthToken(response.data.data.accessToken);
            this.apiService.setRefreshToken(response.data.data.refreshToken?.token);
            this.userService.setAuthUser(response.data.data.user);
            // Persist remembered email
            const rememberMe = this.loginForm.get('rememberMe')?.value === true;
            try {
              if (rememberMe) {
                localStorage.setItem('rememberedEmail', this.loginForm.get('email')?.value || '');
              } else {
                localStorage.removeItem('rememberedEmail');
              }
            } catch (_) {
              // ignore storage errors (private mode, quota, etc.)
            }
            
            // Handle redirect after login
            this.handlePostLoginRedirect();
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          if (error.error.validationErrors) {
            const emailError = error.error.validationErrors['email'];
            const passwordError = error.error.validationErrors['password'];
            
            // Display field-specific errors in your form
            if(emailError){
              this.loginForm.controls['email'].setErrors({ server: emailError });
            }

            if(passwordError){
              this.loginForm.controls['password'].setErrors({ server: passwordError });
            }
          } else {
            // Alternatively, set a general error message
            this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
          }
          this.isSubmitting = false;
        }
      });
  }

  private handlePostLoginRedirect(): void {
    // Check if there's a redirect URL stored
    if (this.redirectUrl) {
      const url = this.redirectUrl;
      // Clear the stored redirect URL
      sessionStorage.removeItem('redirectUrl');
      // Navigate to the intended URL
      this.router.navigateByUrl(url);
    } else if(this.uiService.isSubDomain()){
      // Skip fetching/setting store if already present
      if (appState.store && appState.store._id) {
        this.router.navigate(['dashboard']);
      } else {
        this.storeService.getAllStores(1, 1).subscribe({
          next: (res) => {
            console.log('App: Store API response:', res);
            if (res?.items?.length > 0) {
              const store = res.items[0];
              console.log('App: First store found:', store);
              // Ensure all required fields are present
              if (store._id) {
                const storeData = {
                  _id: store._id,
                  name: store.name || '',
                  code: store.code || '',
                  status: (store.status as 'active' | 'inactive') || 'active',
                  createdBy: store.createdBy || ''
                };
                console.log('App: Setting store in app state:', storeData);
                if (!appState.store || !appState.store._id) {
                  appState.setStore(storeData);
                }
              } else {
                console.warn('App: Store found but missing _id:', store);
              }
            } else {
              console.warn('App: No stores found in response:', res);
            }
            appState.setLoading(false);
            this.router.navigate(['dashboard']);
          },
          error: (err) => {
            console.error('App: Store check failed:', err);
            appState.setLoading(false);
            // Don't clear store on error, keep existing data if any
            this.router.navigate(['dashboard']);
          }
        });
      }
    } else {
      // Default redirect to dashboard
      this.router.navigate(['dashboard']);
    }
  }
}

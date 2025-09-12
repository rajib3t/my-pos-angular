import { Component } from '@angular/core';
import { AuthLayout } from '../../../shared/layout/auth/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ApiResponse  } from '../../../services/api-response.model';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
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
export class Login {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
     private fb: FormBuilder,
     private apiService: ApiService,
     private router: Router,
     private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
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
              // Redirect to dashboard or another page
              this.router.navigate(['/dashboard']);
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

              
            }else{
              // Alternatively, set a general error message
              this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
              this.isSubmitting = false;
            }
           
          }
        });
  }
}

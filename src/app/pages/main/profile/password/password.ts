import { Component, OnInit, OnDestroy , inject, DestroyRef} from '@angular/core';
import { FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
// Move the validator function outside the component
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  standalone: true,
  selector: 'app-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './password.html',
  styleUrl: './password.css',
  
})
export class Password implements OnInit {
  passwordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
   private destroyRef = inject(DestroyRef);
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    
    // Initialize the form with correct control names
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]], // Changed to 8 to match template
      confirmPassword: ['', [Validators.required]] // Fixed name to match template
    }, { validators: passwordsMatchValidator });
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.userService.updatePassword(
        this.passwordForm.value.currentPassword,
        this.passwordForm.value.newPassword
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Password changed successfully.';
          this.passwordForm.reset();
          
          // Auto-dismiss success message after 5 seconds
          timer(3000).pipe(
          takeUntilDestroyed(this.destroyRef)
          ).subscribe(() => {
            this.successMessage = '';
          });
        },
        error: (error) => {
          this.isSubmitting = false;
          console.log('Password change error:', error);
          
          // Extract the actual error message from the nested error structure
          let errorMessage = 'An error occurred while changing the password.';
          
          // Try different possible error message locations
          if (error?.error?.error?.message) {
            errorMessage = error.error.error.message;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.errorMessage = errorMessage;

         
          timer(3000).pipe(
          takeUntilDestroyed(this.destroyRef)
          ).subscribe(() => {
            this.errorMessage = '';
          });
        }
      });
      
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      
      // Auto-dismiss error message after 5 seconds
      timer(3000).pipe(
            takeUntilDestroyed(this.destroyRef)
            ).subscribe(() => {
              this.errorMessage = '';
        });
    }
  }

  // Method to manually dismiss messages
  dismissMessage(type: 'error' | 'success') {
    if (type === 'error') {
      this.errorMessage = '';
    } else {
      this.successMessage = '';
    }
  }

  ngOnInit(): void {
    this.isSubmitting = false;
   // console.log('Password component initialized');
  }

  
}
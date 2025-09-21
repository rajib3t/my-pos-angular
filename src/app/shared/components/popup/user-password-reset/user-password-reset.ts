import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService, User, UserList } from 'src/app/services/user.service';
import { LucideAngularModule,  KeyIcon} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormService } from '@/app/services/form.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-user-password-reset',
  imports: 
  [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-password-reset.html',
  styleUrl: './user-password-reset.css'
})
export class UserPasswordReset {
  readonly KeyIcon = KeyIcon;
  @Input() userToResetPassword: Partial<UserList['items'][0]> | null = null;
  @Input() tenantId: string | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() passwordReset = new EventEmitter<{ user: Partial<UserList['items'][0]>; success: boolean; error?: any }>();
  passwordResetForm: FormGroup;
  public isResettingPassword = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private formService: FormService
  ) {
    this.passwordResetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.formService.passwordsMatchValidator });
  }

 

  closeResetPasswordPopup(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (!this.userToResetPassword) return;
    if(this. passwordResetForm.invalid) {
      this.passwordResetForm.markAllAsTouched();
      return;
    }
    const newPassword = this.passwordResetForm.get('password')?.value;
    const confirmPassword = this.passwordResetForm.get('confirmPassword')?.value;

    

    this.isResettingPassword = true;

    

    this.userService.resetPassword(this.userToResetPassword?._id as string, newPassword, this.tenantId as string).subscribe({
      next: () => {
        this.isResettingPassword = false;
        this.passwordReset.emit({ user: this.userToResetPassword!, success: true });
        this.successMessage = 'Password reset successfully!';
        timer(2000).subscribe(() => {
          this.successMessage = null;
           this.closeResetPasswordPopup();
        });
       
      },
      error: (error) => {
        this.isResettingPassword = false;
        this.passwordReset.emit({ user: this.userToResetPassword!, success: false, error });
        this.errorMessage = 'Failed to reset password. Please try again.';
        timer(2000).subscribe(() => {
          this.errorMessage = null;
          this.closeResetPasswordPopup();
        }); 
      }
    });
  }

   get password() {
    return this.passwordResetForm.get('password');
  }

  get confirmPassword() {
    return this.passwordResetForm.get('confirmPassword');
  }

  // Password Strength Methods
  getPasswordValue(): string {
    return this.passwordResetForm.get('password')?.value || '';
  }

  getPasswordStrength(): number {
    const password = this.getPasswordValue();
    let strength = 0;
    
    if (this.hasMinLength()) strength++;
    if (this.hasLowerCase()) strength++;
    if (this.hasUpperCase()) strength++;
    if (this.hasNumber()) strength++;
    if (this.hasSpecialChar()) strength++;
    
    return strength;
  }

  hasMinLength(): boolean {
    return this.getPasswordValue().length >= 8;
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.getPasswordValue());
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.getPasswordValue());
  }

  hasNumber(): boolean {
    return /\d/.test(this.getPasswordValue());
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.getPasswordValue());
  }

  getPasswordStrengthBarClass(barIndex: number): string {
    const strength = this.getPasswordStrength();
    
    if (barIndex <= strength) {
      switch (strength) {
        case 1:
        case 2:
          return 'bg-red-400';
        case 3:
          return 'bg-yellow-400';
        case 4:
          return 'bg-blue-400';
        case 5:
          return 'bg-green-400';
        default:
          return 'bg-gray-200';
      }
    }
    return 'bg-gray-200';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    
    switch (strength) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  }

  getPasswordStrengthTextClass(): string {
    const strength = this.getPasswordStrength();
    
    switch (strength) {
      case 0:
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-red-400';
      case 3:
        return 'text-yellow-500';
      case 4:
        return 'text-blue-500';
      case 5:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  // Password visibility toggle
  togglePasswordVisibility(fieldId: string): void {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    if (field) {
      field.type = field.type === 'password' ? 'text' : 'password';
    }
  }
}

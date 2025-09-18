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
 



}

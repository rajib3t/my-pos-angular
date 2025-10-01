import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule,User as UserIcon , Mail as MailIcon, LockKeyhole as LockKeyholeIcon, LayoutList , ShieldCheck} from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { timer } from 'rxjs';
import { UserService } from '@/app/services/user.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormService } from '@/app/services/form.service';

@Component({
  selector: 'app-tenant-user-create',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate implements OnInit {
  
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly LockKeyholeIcon = LockKeyholeIcon;
  readonly HouseIcon = LayoutList;
  readonly ShieldCheckIcon = ShieldCheck;
  errorMessage: string | null = null;

  ngOnInit() {
     
  }
  successMessage: string | null = null;
  isSubmitting = false;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formService: FormService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: formService.passwordsMatchValidator });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.userForm.value;
    this.userService.createUser(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'User created successfully!';
        this.userForm.reset();
        // Optionally, reset form validation states
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.setErrors(null);
        });
        // Clear success message after a delay
        timer(3000).subscribe(() => {
          this.successMessage = null;
        });
      },
      error: (error) => {

        if(error.error.validationErrors) {
          const validationErrors = error.error.validationErrors;
          Object.keys(validationErrors).forEach(prop => {
            const formControl = this.userForm.get(prop);
            if (formControl) {
              // Set the server validation error on the form control
              formControl.setErrors({
                server: validationErrors[prop]
              });
            }
          });
          this.isSubmitting = false;
          this.errorMessage = 'Please correct the errors in the form.';
          // Clear error message after a delay
          timer(5000).subscribe(() => {
            this.errorMessage = null;
          });
        }else{
          this.isSubmitting = false;
          this.errorMessage = error?.error?.message || 'An error occurred while creating the user.';
          // Clear error message after a delay
          timer(5000).subscribe(() => {
            this.errorMessage = null;
          });
        }
        
      }
    });
  }

  get name() {
    return this.userForm.get('name');
  }

  get email() {
    return this.userForm.get('email');
  }

  get mobile() {
    return this.userForm.get('mobile');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  get role() {
    return this.userForm.get('role');
  }


  goToUserList() : void {
    this.router.navigate(['/users']);
  
  }

  gotoTenantList(): void {
    this.router.navigate(['/tenants']);
  }

  // Dynamic Progress Methods
  getStepProgress(step: number): number {
    const fields = this.getStepFields(step);
    const validFields = fields.filter(field => this.userForm.get(field)?.valid).length;
    return Math.round((validFields / fields.length) * 100);
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 1: return ['name'];
      case 2: return ['email', 'mobile'];
      case 3: return ['password', 'confirmPassword', 'role'];
      default: return [];
    }
  }

  isStepCompleted(step: number): boolean {
    return this.getStepProgress(step) === 100;
  }

  isStepActive(step: number): boolean {
    const previousStep = step - 1;
    if (step === 1) return true;
    return previousStep === 0 || this.isStepCompleted(previousStep);
  }

  getStepClass(step: number): string {
    const baseClass = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-500 transform';
    
    if (this.isStepCompleted(step)) {
      return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 scale-110`;
    } else if (this.isStepActive(step)) {
      switch (step) {
        case 1: return `${baseClass} bg-gradient-to-r from-blue-500 to-indigo-500 scale-105`;
        case 2: return `${baseClass} bg-gradient-to-r from-indigo-500 to-purple-500 scale-105`;
        case 3: return `${baseClass} bg-gradient-to-r from-purple-500 to-pink-500 scale-105`;
        default: return `${baseClass} bg-gray-300`;
      }
    } else {
      return `${baseClass} bg-gray-300`;
    }
  }

  getStepTextClass(step: number): string {
    if (this.isStepCompleted(step)) {
      return 'text-green-600';
    } else if (this.isStepActive(step)) {
      switch (step) {
        case 1: return 'text-blue-600';
        case 2: return 'text-indigo-600';
        case 3: return 'text-purple-600';
        default: return 'text-gray-500';
      }
    } else {
      return 'text-gray-500';
    }
  }

  getProgressWidth(fromStep: number, toStep: number): number {
    const fromProgress = this.getStepProgress(fromStep);
    if (fromProgress === 100) {
      const toProgress = this.getStepProgress(toStep);
      return toProgress;
    }
    return 0;
  }

  getOverallProgress(): number {
    const allFields = ['name', 'email', 'mobile', 'password', 'confirmPassword', 'role'];
    const validFields = allFields.filter(field => this.userForm.get(field)?.valid).length;
    return Math.round((validFields / allFields.length) * 100);
  }

  // Password Strength Methods
  getPasswordValue(): string {
    return this.userForm.get('password')?.value || '';
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
}

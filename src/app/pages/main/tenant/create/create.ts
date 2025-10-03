import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../../services/tenant.service';
import { timer } from 'rxjs';
import { LucideAngularModule, SquarePlus, LayoutList } from 'lucide-angular';
import { RouterModule , Router} from '@angular/router';
import { UiService } from '@/app/services/ui.service';
import { ConfigService } from '@/app/services/config.service';
@Component({
  selector: 'app-create',
  imports: [
     CommonModule,
    ReactiveFormsModule,
      LucideAngularModule,
      RouterModule
  ],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class CreateTenant implements OnInit {
   readonly TenantAddIcon = SquarePlus;
   readonly HouseIcon = LayoutList;
   tenantForm: FormGroup;
   errorMessage: string | null = null;
   successMessage: string | null = null;
   isSubmitting = false;
   showPassword = false;
   showConfirmPassword = false;
   readonly mainDomain: string;
   private destroyRef = inject(DestroyRef);
   constructor(
         private fb: FormBuilder,
         private tenantService: TenantService,
         private router: Router,
         private uiService : UiService,
         private configService: ConfigService
   ) {
      this.mainDomain = this.configService.mainDomain;
      this.tenantForm = this.fb.group({
         name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
         subdomain: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$')]], // Alphanumeric and hyphens only
         ownerName: ['', [Validators.required, Validators.minLength(2)]],
         ownerEmail: ['', [Validators.required, Validators.email]],
         ownerMobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
         ownerPassword: ['', [Validators.required, Validators.minLength(6)]],
         confirmPassword: ['', [Validators.required]],
      }, { validators: CreateTenant.passwordsMatchValidator });
   }

   // Custom validator for matching passwords
   static passwordsMatchValidator(form: FormGroup) {
      const password = form.get('ownerPassword')?.value;
      const confirm = form.get('confirmPassword')?.value;
      if (password !== confirm) {
         form.get('confirmPassword')?.setErrors({ ...(form.get('confirmPassword')?.errors || {}), mismatch: true });
         return { mismatch: true };
      } else {
         if (form.get('confirmPassword')?.hasError('mismatch')) {
         const errors = { ...(form.get('confirmPassword')?.errors || {}) };
         delete errors['mismatch'];
         if (Object.keys(errors).length === 0) {
            form.get('confirmPassword')?.setErrors(null);
         } else {
            form.get('confirmPassword')?.setErrors(errors);
         }
         }
         return null;
      }
   }
  

   ngOnInit(): void {
         this.tenantForm.get('name')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.onNameChange());
      }

   onSubmit() {
      if (this.tenantForm.valid) {
         this.isSubmitting = true;
         this.errorMessage = null;
         this.successMessage = null;
         this.tenantService.createTenant(this.tenantForm.value)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
               next: (tenant) => {
                  this.successMessage = 'Sub account created successfully!';
                  this.tenantForm.reset();
                  this.isSubmitting = false;
                  this.uiService.success(this.successMessage, 'Sub Account', 2000)
                  timer(3000).pipe(
                     takeUntilDestroyed(this.destroyRef)
                     ).subscribe(() => {
                     this.successMessage = '';
                     });
               },
               error: (error) => {
                     
                     if (error.error.validationErrors) {
                        const nameError = error.error.validationErrors['name'];
                        const subdomainError = error.error.validationErrors['subdomain'];
                        const ownerNameError = error.error.validationErrors['ownerName'];
                        const ownerEmailError = error.error.validationErrors['ownerEmail'];
                        const ownerMobileError = error.error.validationErrors['ownerMobile'];
                        const ownerPasswordError = error.error.validationErrors['ownerPassword'];
                        const confirmPasswordError = error.error.validationErrors['confirmPassword'];
                        if (nameError) {
                           this.tenantForm.controls['name'].setErrors({ server: nameError });
                        }
                        if (subdomainError) {
                           this.tenantForm.controls['subdomain'].setErrors({ server: subdomainError });
                        }
                        if (ownerNameError) {
                           this.tenantForm.controls['ownerName'].setErrors({ server: ownerNameError });
                        }
                        if (ownerEmailError) {
                           this.tenantForm.controls['ownerEmail'].setErrors({ server: ownerEmailError });
                        }
                        if (ownerMobileError) {
                           this.tenantForm.controls['ownerMobile'].setErrors({ server: ownerMobileError });
                        }
                        if (ownerPasswordError) {
                           this.tenantForm.controls['ownerPassword'].setErrors({ server: ownerPasswordError });
                        }
                        if (confirmPasswordError) {
                           this.tenantForm.controls['confirmPassword'].setErrors({ server: confirmPasswordError });
                        }
                        if (!nameError && !subdomainError && !ownerNameError && !ownerEmailError && !ownerMobileError && !ownerPasswordError && !confirmPasswordError) {
                           this.errorMessage = 'Failed to create tenant. Please check the form for errors.';
                        }
                        this.isSubmitting = false;
                        timer(5000).pipe(
                           takeUntilDestroyed(this.destroyRef)
                        ).subscribe(() => {
                           this.errorMessage = '';
                        });
                     } else {
                        this.errorMessage = 'Failed to create sub account. Please try again.';
                        this.isSubmitting = false;
                        timer(3000).pipe(
                           takeUntilDestroyed(this.destroyRef)
                        ).subscribe(() => {
                           this.errorMessage = '';
                        });
                     }
               }
            });
      } else {
         this.errorMessage = 'Please correct the errors in the form.';
         this.successMessage = null;
      }
   }


   onNameChange() {
      const nameValue = this.tenantForm.get('name')?.value || '';
      const subdomain = nameValue
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
         .replace(/^-+|-+$/g, '');    // Trim leading/trailing hyphens
      this.tenantForm.get('subdomain')?.setValue(subdomain, { emitEvent: false });
   }

   ngAfterViewInit(): void {
      this.tenantForm.get('name')?.valueChanges
         .pipe(takeUntilDestroyed(this.destroyRef))
         .subscribe(() => this.onNameChange());
   }


   gotoTenantList() {
      // Implement navigation to tenant list page
      this.router.navigate(['/tenants']);
   }

   togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
   }

   toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
   }

   // Dynamic Progress Methods
   getStepProgress(step: number): number {
      const fields = this.getStepFields(step);
      const validFields = fields.filter(field => this.tenantForm.get(field)?.valid).length;
      return Math.round((validFields / fields.length) * 100);
   }

   getStepFields(step: number): string[] {
      switch (step) {
         case 1: return ['name', 'subdomain'];
         case 2: return ['ownerName', 'ownerEmail', 'ownerMobile'];
         case 3: return ['ownerPassword', 'confirmPassword'];
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
      const baseClass = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-500 transform';
      
      if (this.isStepCompleted(step)) {
         return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 scale-110`;
      } else if (this.isStepActive(step)) {
         switch (step) {
            case 1: return `${baseClass} bg-gradient-to-r from-indigo-500 to-purple-500 scale-105`;
            case 2: return `${baseClass} bg-gradient-to-r from-purple-500 to-pink-500 scale-105`;
            case 3: return `${baseClass} bg-gradient-to-r from-pink-500 to-red-500 scale-105`;
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
            case 1: return 'text-indigo-600';
            case 2: return 'text-purple-600';
            case 3: return 'text-pink-600';
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
      const allFields = ['name', 'subdomain', 'ownerName', 'ownerEmail', 'ownerMobile', 'ownerPassword', 'confirmPassword'];
      const validFields = allFields.filter(field => this.tenantForm.get(field)?.valid).length;
      return Math.round((validFields / allFields.length) * 100);
   }

   // Password Strength Methods
   getPasswordValue(): string {
      return this.tenantForm.get('ownerPassword')?.value || '';
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


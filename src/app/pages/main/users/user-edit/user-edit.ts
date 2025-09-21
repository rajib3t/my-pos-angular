import { Component, OnInit, signal, DestroyRef , inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { User, UserService } from '@/app/services/user.service';
import { ReactiveFormsModule , FormBuilder, FormGroup, Validators} from '@angular/forms';
import { FormChangeTracker, FormService } from '@/app/services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { LucideAngularModule, LayoutList } from 'lucide-angular';
interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface UserEditData extends User {
  address?: Address;
}

@Component({
  selector: 'app-tenant-user-edit',
  imports: [CommonModule, RouterModule,  ReactiveFormsModule,LucideAngularModule],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css'
})
export class UserEdit implements OnInit {
  readonly HouseIcon = LayoutList;
  editForm: FormGroup;
  
  userId : string = null!;
  user : UserEditData | null = null!;
  isLoading = true
  errorMessage = ''
  successMessage = ''
  formTracker!: FormChangeTracker;
  isChangingInfo = false;
  isSubmitting = false;
  private destroyRef = inject(DestroyRef);
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private formService: FormService,
    private router : Router
  ){
    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      mobile: ['', [Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],  // Optional field
      address: [''], // Optional field
      city: [''],    // Optional field
      state: [''],   // Optional field
      postalCode: [''], // Optional field
    });
  }


  ngOnInit(): void {
      this.activatedRoute.paramMap.subscribe(params => {
        this.userId = params.get('id') || '';
      });
      this.userService.getUser(this.userId).subscribe(data=>{
        this.user = data
        this.isLoading = false
        if (this.user) {
          // Prepare original values for form tracker
          const originalValues = {
            email: this.user.email || '',
            name: this.user.name || '',
            mobile: this.user.mobile || '',
            // If your backend stores address as an object, convert to the text fields we use in the form:
            address: this.user.address?.street || '',
            city: this.user.address?.city || '',
            state: this.user.address?.state || '',
            postalCode: this.user.address?.zip || '',
          };
          // Populate form with user data
          this.editForm.patchValue(originalValues);

          // Setup form change tracking using FormService
          this.formTracker = this.formService.createFormChangeTracker({
            form: this.editForm,
            originalValues: originalValues,
            destroyRef: this.destroyRef,
            onChangeCallback: (hasChanges: boolean) => {
              this.isChangingInfo = hasChanges;
            }
          });
        }
      });
  }
  

  onSubmit(): void {
    if(this.editForm.invalid){
      this.errorMessage = 'Validation error';
      timer(3000).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(() => {
        this.errorMessage = '';
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Check if form has changes using the form tracker
    if (!this.formTracker || !this.formTracker.hasChanges) {
      this.isSubmitting = false;
      return;
    }

    // Get only the changed fields using form tracker utility
    const currentValues = this.editForm.value;
    const changedFields: Record<string, any> = {};

    // Since we're using FormService, we can get changed fields by comparing with form tracker
    // For now, let's send all current non-empty values when there are changes
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== null && currentValues[key] !== undefined && String(currentValues[key]).trim() !== '') {
        changedFields[key] = currentValues[key];
      }
    });

    this.userService.updateUser(this.userId, changedFields).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedProfile) => {
        // Update local user data
        this.user = updatedProfile;
        // Update form tracker with new original values
        if (updatedProfile) {
          const newOriginalValues = {
            email: this.user.email || '',
            name: this.user.name || '',
            mobile: this.user.mobile || '',
            address: this.user.address?.street || '',
            city: this.user.address?.city || '',
            state: this.user.address?.state || '',
            postalCode: this.user.address?.zip || '',
          };

          this.editForm.patchValue(newOriginalValues);
          this.formTracker.updateOriginalValues(newOriginalValues);
        }
        
        this.successMessage = updatedProfile ? 'Profile updated successfully.' : 'No changes were made.';
        this.isSubmitting = false;
        this.isChangingInfo = false; // Reset the change flag after successful update
        
        timer(3000).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          this.successMessage = '';
        });
      },
      error: (error) => {
        if (error.error.validationErrors) {
              const emailError = error.error.validationErrors['email'];
              const nameError = error.error.validationErrors['name'];
              const mobileError = error.error.validationErrors['mobile'];
              const postalCodeError = error.error.validationErrors['postalCode'];
              const cityError = error.error.validationErrors['city'];
              const stateError = error.error.validationErrors['state'];
              const addressError = error.error.validationErrors['address'];
              
              
              // Display field-specific errors in your form
              if(emailError){
                this.editForm.controls['email'].setErrors({ server: emailError });
              }
              if(nameError){
                this.editForm.controls['name'].setErrors({ server: nameError });
              }
              if(mobileError){
                this.editForm.controls['mobile'].setErrors({ server: mobileError });
              }
              if(postalCodeError){
                this.editForm.controls['postalCode'].setErrors({ server: postalCodeError });
              }
              if(cityError){
                this.editForm.controls['city'].setErrors({ server: cityError });
              }
              if(stateError){
                this.editForm.controls['state'].setErrors({ server: stateError });
              }
              if(addressError){
                this.editForm.controls['address'].setErrors({ server: addressError });
              }

             this.isSubmitting = false;
              

              
            }else{
              this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
                this.isSubmitting = false;
                timer(3000).pipe(
                  takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                  this.errorMessage = '';
                });
            }
       
      }
    });
   
  }

  backToTenantList(): void {
    this.router.navigate(['/tenants']);
   
  }

  gotoTenantUsers(): void {
    this.router.navigate(['/users']);
  }

  // Dynamic Progress Methods
  getStepProgress(step: number): number {
    const fields = this.getStepFields(step);
    const validFields = fields.filter(field => this.editForm.get(field)?.valid).length;
    return Math.round((validFields / fields.length) * 100);
  }

  getStepFields(step: number): string[] {
    switch (step) {
      case 1: return ['name', 'email'];
      case 2: return ['mobile'];
      case 3: return ['address', 'city', 'state', 'postalCode'];
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
    const allFields = ['name', 'email', 'mobile', 'address', 'city', 'state', 'postalCode'];
    const validFields = allFields.filter(field => this.editForm.get(field)?.valid).length;
    return Math.round((validFields / allFields.length) * 100);
  }
}

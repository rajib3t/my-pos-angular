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
  tenantId : string = null!;
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
      name: ['', [Validators.required]],
      mobile: [''],  // Optional field
      address: [''], // Optional field
      city: [''],    // Optional field
      state: [''],   // Optional field
      postalCode: [''], // Optional field
    });
  }


  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
        this.tenantId = params.get('id') || '';
        this.userId = params.get('userId') || '';
      });

      this.userService.getUser(this.userId, this.tenantId).subscribe(data=>{
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

    this.userService.updateUser(this.userId, changedFields, this.tenantId).pipe(
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
    this.router.navigate(['/tenants', this.tenantId, 'users']);
  }


}

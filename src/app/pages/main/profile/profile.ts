import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData, UserService } from '../../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { FormService, FormChangeTracker } from '../../../services/form.service';


import { timer } from 'rxjs';
@Component({
  selector: 'app-profile',
  standalone: true,                 // required when using `imports` on a component
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  user: ProfileData | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isChangingInfo = false;
  isLoading = true;

  // Form change tracker from service
  formTracker!: FormChangeTracker;
  private destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private apiService: ApiService,
    private formService: FormService,
  ) {
    this.profileForm = this.fb.group({
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
    this.userService.profileUserData.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          // Prepare original values for form tracker
          const originalValues = {
            email: user.email || '',
            name: user.name || '',
            mobile: user.mobile || '',
            // If your backend stores address as an object, convert to the text fields we use in the form:
            address: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            postalCode: user.address?.zip || '',
          };

          // Populate form with user data
          this.profileForm.patchValue(originalValues);
          
          // Setup form change tracking using FormService
          this.formTracker = this.formService.createFormChangeTracker({
            form: this.profileForm,
            originalValues: originalValues,
            destroyRef: this.destroyRef,
            onChangeCallback: (hasChanges: boolean) => {
              this.isChangingInfo = hasChanges;
            }
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.errorMessage = 'Error loading profile data.';
        this.isLoading = false;
      }
    });

    // Trigger API fetch (keeps existing behavior)
    this.userService.fetchProfileData();
  }

  onSubmit(): void {
    if(this.profileForm.invalid){
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
    const currentValues = this.profileForm.value;
    const changedFields: Record<string, any> = {};

    // Since we're using FormService, we can get changed fields by comparing with form tracker
    // For now, let's send all current non-empty values when there are changes
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== null && currentValues[key] !== undefined && String(currentValues[key]).trim() !== '') {
        changedFields[key] = currentValues[key];
      }
    });

    this.userService.updateProfileData(changedFields).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedProfile) => {
        // Update local user data
        this.user = updatedProfile;
        
        // Update form tracker with new original values
        if (updatedProfile) {
          const newOriginalValues = {
            email: updatedProfile.email || '',
            name: updatedProfile.name || '',
            mobile: updatedProfile.mobile || '',
            address: updatedProfile.address?.street || '',
            city: updatedProfile.address?.city || '',
            state: updatedProfile.address?.state || '',
            postalCode: updatedProfile.address?.zip || '',
          };
          
          this.profileForm.patchValue(newOriginalValues);
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
                this.profileForm.controls['email'].setErrors({ server: emailError });
              }
              if(nameError){
                this.profileForm.controls['name'].setErrors({ server: nameError });
              }
              if(mobileError){
                this.profileForm.controls['mobile'].setErrors({ server: mobileError });
              }
              if(postalCodeError){
                this.profileForm.controls['postalCode'].setErrors({ server: postalCodeError });
              }
              if(cityError){
                this.profileForm.controls['city'].setErrors({ server: cityError });
              }
              if(stateError){
                this.profileForm.controls['state'].setErrors({ server: stateError });
              }
              if(addressError){
                this.profileForm.controls['address'].setErrors({ server: addressError });
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


}

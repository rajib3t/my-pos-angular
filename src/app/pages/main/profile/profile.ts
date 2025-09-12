import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData, UserService } from '../../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';


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

  // Store original values to compare against
  private originalValues: Record<string, any> = {};
  private destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      address: [''],
      city: [''],
      state: [''],
      postalCode: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.userService.profileUserData.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          // Store original values for comparison (use same keys as the form)
          this.originalValues = {
            email: user.email || '',
            name: user.name || '',
            mobile: user.mobile || '',
            // If your backend stores address as an object, convert to the text fields we use in the form:
            address: user.address?.street || '',
            city: user.address?.city ?? '',
            state: user.address?.state ?? '',
            postalCode: user.address?.zip ?? '',
          };

          // Populate form with user data when available
          this.profileForm.patchValue(this.originalValues);
          
          // Setup form change detection after initial values are set
          this.setupFormChangeDetection();
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

  private normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private setupFormChangeDetection(): void {
    // Listen to form value changes
    this.profileForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkForChanges();
    });
  }

  private checkForChanges(): void {
    if (!this.originalValues || Object.keys(this.originalValues).length === 0) {
      this.isChangingInfo = false;
      return;
    }

    const currentValues = this.profileForm.value;
    let hasChanges = false;

    // Compare current values with original values using normalized strings
    Object.keys(currentValues).forEach(key => {
      const currentValue = this.normalizeValue(currentValues[key]);
      const originalValue = this.normalizeValue(this.originalValues[key]);

      if (currentValue !== originalValue) {
        hasChanges = true;
      }
    });

    this.isChangingInfo = hasChanges;
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

    // Check originalValues
    if (!this.originalValues || Object.keys(this.originalValues).length === 0) {
      console.error('Original values not set properly');
      this.isSubmitting = false;
      return;
    }

    const currentValues = this.profileForm.value;
    const changedFields: Record<string, any> = {};

    // Compare current values with original values using normalized strings
    Object.keys(currentValues).forEach(key => {
      const currentValue = this.normalizeValue(currentValues[key]);
      const originalValue = this.normalizeValue(this.originalValues[key]);

      

      if (currentValue !== originalValue) {
        
        changedFields[key] = currentValues[key];
      }
    });



    // Nothing changed
    if (Object.keys(changedFields).length === 0) {
      this.isSubmitting = false;
      

      // fallback: show what would be sent if you wanted to send non-empty fields
      const nonEmptyFields: Record<string, any> = {};
      Object.keys(currentValues).forEach(key => {
        if (currentValues[key] !== null && currentValues[key] !== undefined && String(currentValues[key]).trim() !== '') {
          nonEmptyFields[key] = currentValues[key];
        }
      });

     
      return;
    }
    this.userService.updateProfileData(changedFields).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedProfile) => {
        // Update local user data and original values
        this.user = updatedProfile;
        this.originalValues = { ...this.originalValues, ...changedFields };
        this.profileForm.patchValue(this.originalValues);
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

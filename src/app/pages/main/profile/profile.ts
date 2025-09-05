import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileData, UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-profile',
  standalone: true,                 // required when using `imports` on a component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],      // fixed property name (was styleUrl)
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeOut', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class Profile implements OnInit, OnDestroy {
  profileForm: FormGroup;
  private userSubscription?: Subscription;
  user: ProfileData | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Store original values to compare against
  private originalValues: Record<string, any> = {};

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
    this.userSubscription = this.userService.profileUserData.subscribe({
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
        }
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        this.errorMessage = 'Error loading profile data.';
      }
    });

    // Trigger API fetch (keeps existing behavior)
    this.userService.fetchProfileData();
  }

  ngOnDestroy(): void {
    // Guard unsubscribe
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  onSubmit(): void {
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

      console.log(`Comparing ${key}: "${originalValue}" vs "${currentValue}"`);

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

    this.apiService.protectedPatch<any>('profile', changedFields)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            

            // Update originalValues with the new values after successful update
            this.originalValues = { ...this.originalValues, ...changedFields };

            // Optionally re-patch the form so it's in sync
            this.profileForm.patchValue(this.originalValues);
            this.successMessage = response.data.message || 'Profile updated successfully.';
          } else {
            this.errorMessage = 'Profile Update failed. Please try again.';
          }
          this.isSubmitting = false;
          this.errorMessage = '';
        },
        error: (error) => {
          console.log('Profile update error:', error);
          
          this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
          this.isSubmitting = false;
        }
      });
  }


}

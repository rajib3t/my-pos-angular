import { Component, OnInit, inject , DestroyRef, effect} from '@angular/core';
import { appState } from  '@/app/state/app.state'
import { LucideAngularModule,  Store as StoreIcon, Phone as PhoneIcon, AtSign as AtSignIcon, Route} from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CommonModule} from '@angular/common'
import {FormService} from '@/app/services/form.service'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StoreService } from '@/app/services/store.service';
import { RouterModule, Router } from '@angular/router';
import { timer } from 'rxjs';
@Component({
  selector: 'app-first-store-create',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './first-store-create.html',
  styleUrl: './first-store-create.css'
})
export class FirstStoreCreate implements OnInit {
  readonly StoreIcon = StoreIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly AtSignIcon = AtSignIcon;
  isSubmitting = false
  firstStoreCreateForm : FormGroup
  private destroyRef = inject(DestroyRef);
 

  successMessage : string | null = null;
  errorMessage:string | null = null;
  showFirstStoreCreate = false;
  isCheckingStores = true; // Add loading state to prevent premature popup display


  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private storeService: StoreService,
    private router: Router,
  ) {
    this.firstStoreCreateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(8)]],
      code: ['', [
        Validators.required, 
        this.formService.uppercaseValidator(),
        Validators.minLength(2),
        Validators.maxLength(10)
      ]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(10)]]
    });

    // Watch for store changes in app state
    const storeEffect = effect(() => {
      const store = appState.store;
      const loading = appState.loading;
      console.log('FirstStoreCreate: Store state changed:', store, 'Loading:', loading);
      
      // Only show popup if:
      // 1. Not loading (store fetch completed)
      // 2. No store exists
      // 3. User is authenticated
      if (!loading && appState.isAuthenticated) {
        this.isCheckingStores = false;
        this.showFirstStoreCreate = store === null;
        console.log('FirstStoreCreate: Should show popup:', this.showFirstStoreCreate);
      } else if (loading) {
        this.isCheckingStores = true;
        this.showFirstStoreCreate = false;
      }
    });

    // Clean up the effect when the component is destroyed
    this.destroyRef.onDestroy(() => storeEffect.destroy());
  }

  ngOnInit(): void {
    this.firstStoreCreateForm.get('name')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.onNameChange());
    
    // Fallback: If still checking stores after 5 seconds, assume no stores exist
    timer(5000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.isCheckingStores && appState.isAuthenticated && !appState.store) {
        console.log('FirstStoreCreate: Timeout reached, assuming no stores exist');
        this.isCheckingStores = false;
        this.showFirstStoreCreate = true;
      }
    });
  }
    get isFirstStore() {
        // Don't show popup while checking stores or if not authenticated
        if (this.isCheckingStores || !appState.isAuthenticated) {
          return false;
        }
        return this.showFirstStoreCreate;
      }

    onSubmit(): void{
      if (this.firstStoreCreateForm.valid) {
          this.isSubmitting = true;
          this.errorMessage = null;
          this.successMessage = null
          this.storeService.create(this.firstStoreCreateForm.value).pipe(
            takeUntilDestroyed(this.destroyRef)

          ).subscribe({
           next: (data) => {
                this.isSubmitting = false;
                this.successMessage = 'Store created successfully';
                console.log('FirstStoreCreate: Store created successfully:', data);
                
                // Set the store in app state with proper type handling
                if (data && data._id) {
                  const storeData = {
                    _id: data._id,
                    name: data.name || '',
                    code: data.code || '',
                    status: (data.status as 'active' | 'inactive') || 'active',
                    createdBy: data.createdBy || ''
                  };
                  console.log('FirstStoreCreate: Setting store in app state:', storeData);
                  appState.setStore(storeData);
                } else {
                  console.error('FirstStoreCreate: Invalid store data received:', data);
                }
                 timer(3000).pipe(
                  takeUntilDestroyed(this.destroyRef)
                  ).subscribe(() => {
                    this.successMessage = '';
                    this.router.navigate(['dashboard'])
                });
              

            },
            error: (error) => {
              if (error.error.validationErrors) {
                const nameError = error.error.validationErrors['name'];
                const codeError = error.error.validationErrors['code'];
                const emailError = error.error.validationErrors['email'];
                const mobileError = error.error.validationErrors['mobile'];
                if (nameError) {
                    this.firstStoreCreateForm.controls['name'].setErrors({ server: nameError });
                }
                 if (codeError) {
                    this.firstStoreCreateForm.controls['code'].setErrors({ server: codeError });
                }
                 if (emailError) {
                    this.firstStoreCreateForm.controls['email'].setErrors({ server: emailError });
                }
                if (mobileError) {
                    this.firstStoreCreateForm.controls['mobile'].setErrors({ server: mobileError });
                }
                this.isSubmitting = false;
                timer(5000).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                    this.errorMessage = '';
                });
              }else{
               
                this.isSubmitting = false;
                timer(5000).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                    this.errorMessage = 'Something went wrong, please try again';
                });
                
              }
              
            }
          })
      }
    }
   
     onNameChange() {
      const nameValue = this.firstStoreCreateForm.get('name')?.value || '';
      const code = this.getUserInitials(nameValue)   // Trim leading/trailing hyphens
     
      
      this.firstStoreCreateForm.get('code')?.setValue(code, { emitEvent: false });
   }
  
   getUserInitials(name: string): string {
      if (!name) return '';
      
      const words = name
          .trim()
          .split(/[\s-]+/) // Split by spaces and hyphens
          .filter(word => word.length > 0);
      
      if (words.length === 1) {
          // Single word - return first two characters
          return words[0].substring(0, 2).toUpperCase();
      } else {
          // Multiple words - return first letter of each word
          return words
              .map(word => word.charAt(0).toUpperCase())
              .join('');
      }
  }
}

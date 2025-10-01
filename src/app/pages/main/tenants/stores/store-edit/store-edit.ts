import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule , Album as DashboardIcon, Store as StoreIcon, Phone as PhoneIcon, AtSign as AtSignIcon} from 'lucide-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormService, FormChangeTracker } from '@/app/services/form.service';
import { StoreService, Store } from '@/app/services/store.service';

@Component({
  selector: 'app-store-edit',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './store-edit.html',
  styleUrl: './store-edit.css'
})
export class StoreEdit implements OnInit {
  readonly DashboardIcon = DashboardIcon
  readonly StoreIcon = StoreIcon
  readonly PhoneIcon = PhoneIcon
  readonly AtSignIcon = AtSignIcon
  private destroyRef = inject(DestroyRef);
  storeId: string | null = null;
  successMessage : string | null = null;
  errorMessage:string | null = null;
  isSubmitting : boolean = false
  storeEditForm : FormGroup
  formTracker!: FormChangeTracker;
  isChangingInfo = false;
  originalValues: Partial<Store>| null = null  
  storeData = signal<Store | null>(null);
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private formService : FormService,
    private storeService: StoreService
  ){
    this.storeEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [
        Validators.required,
        this.formService.uppercaseValidator(),
        Validators.minLength(2),
        Validators.maxLength(10)
      ]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.storeId = this.activatedRoute.snapshot.paramMap.get('storeId');
    this.storeEditForm.get('name')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.onNameChange());
    
    if(this.storeId){
      this.storeService.getById(this.storeId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (store) => {
        this.storeData.set(store);
        // Save original values for change tracking
        this.originalValues = store;
        // Patch form with store data
        const originalValues = {
          name: store.name || '',
          code: store.code || '',
          mobile: store.mobile || '',
          email: store.email || ''
        }
        this.storeEditForm.patchValue(originalValues);
        // Setup form change tracking using FormService
          this.formTracker = this.formService.createFormChangeTracker({
            form: this.storeEditForm,
            originalValues:  originalValues,
            destroyRef: this.destroyRef,
            onChangeCallback: (hasChanges: boolean) => {
              this.isChangingInfo = hasChanges;
            }
          });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load store.';
      }
    })
      

          
    }
  }

  loadStore(storeId: string): void{
    
  }

  goToDashBoard(): void{
    this.router.navigate(['dashboard'])
  }

  onSubmit():void{
    if (!this.storeId) { return; }
    if (this.storeEditForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.successMessage = null
      this.storeService.update(this.storeId, this.storeEditForm.value).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (data) => {
          this.isSubmitting = false;
          this.successMessage = 'Store updated successfully';
        },
        error: (error) => {
          if (error.error?.validationErrors) {
            const nameError = error.error.validationErrors['name'];
            const codeError = error.error.validationErrors['code'];
            const emailError = error.error.validationErrors['email'];
            const mobileError = error.error.validationErrors['mobile'];
            if (nameError) {
              this.storeEditForm.controls['name'].setErrors({ server: nameError });
            }
            if (codeError) {
              this.storeEditForm.controls['code'].setErrors({ server: codeError });
            }
            if (emailError) {
              this.storeEditForm.controls['email'].setErrors({ server: emailError });
            }
            if (mobileError) {
              this.storeEditForm.controls['mobile'].setErrors({ server: mobileError });
            }
            this.isSubmitting = false;
          } else {
            this.isSubmitting = false;
            this.errorMessage = 'Something went wrong, please try again';
          }
        }
      })
    }
  }

  onNameChange() {
    const nameValue = this.storeEditForm.get('name')?.value || '';
    const code = this.formService.getUserInitials(nameValue)
    this.storeEditForm.get('code')?.setValue(code, { emitEvent: false });
  }

  // Progress helpers reused from create for consistent UI
  getStepFields(step: number): string[] {
    switch (step) {
      case 1:
        return ['name', 'code'];
      case 2:
        return ['email', 'mobile'];
      default:
        return [];
    }
  }

  getStepProgress(step: number): number {
    const fields = this.getStepFields(step);
    if (fields.length === 0) { return 0; }
    const validFields = fields.filter(field => this.storeEditForm.get(field)?.valid).length;
    return Math.round((validFields / fields.length) * 100);
  }

  isStepCompleted(step: number): boolean {
    return this.getStepProgress(step) === 100;
  }

  isStepActive(step: number): boolean {
    const previousStep = step - 1;
    if (step === 1) { return true; }
    return previousStep === 0 || this.isStepCompleted(previousStep);
  }

  getStepClass(step: number): string {
    const baseClass = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-500 transform';
    if (this.isStepCompleted(step)) {
      return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 scale-110`;
    } else if (this.isStepActive(step)) {
      switch (step) {
        case 1:
          return `${baseClass} bg-gradient-to-r from-blue-500 to-indigo-500 scale-105`;
        case 2:
          return `${baseClass} bg-gradient-to-r from-indigo-500 to-purple-500 scale-105`;
        default:
          return `${baseClass} bg-gray-300`;
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
        case 1:
          return 'text-blue-600';
        case 2:
          return 'text-indigo-600';
        default:
          return 'text-gray-500';
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
    const allFields = ['name', 'code', 'email', 'mobile'];
    const validFields = allFields.filter(field => this.storeEditForm.get(field)?.valid).length;
    return Math.round((validFields / allFields.length) * 100);
  }
}

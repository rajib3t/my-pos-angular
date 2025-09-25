import { CommonModule } from '@angular/common';
import { Component, inject , DestroyRef, effect , OnInit} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule , Album as DashboardIcon, Store as StoreIcon, Phone as PhoneIcon, AtSign as AtSignIcon} from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { FormService } from '@/app/services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StoreService } from '@/app/services/store.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-store-create',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './store-create.html',
  styleUrl: './store-create.css'
})
export class StoreCreate implements OnInit{
  readonly DashboardIcon = DashboardIcon
  readonly StoreIcon = StoreIcon
  readonly PhoneIcon = PhoneIcon;
  readonly AtSignIcon = AtSignIcon;
  private destroyRef = inject(DestroyRef);
  successMessage : string | null = null;
  errorMessage:string | null = null;
  isSubmitting : boolean = false
  storeCreateForm : FormGroup
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private formService : FormService,
    private storeService: StoreService
  ){
    this.storeCreateForm = this.fb.group({
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
    this.storeCreateForm.get('name')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.onNameChange());
  }

  goToDashBoard(): void{
    this.router.navigate(['dashboard'])
  }

  onSubmit():void{
      if (this.storeCreateForm.valid) {
          this.isSubmitting = true;
          this.errorMessage = null;
          this.successMessage = null
          this.storeService.create(this.storeCreateForm.value).pipe(
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
                  
                
                } else {
                  console.error('FirstStoreCreate: Invalid store data received:', data);
                }
                 timer(3000).pipe(
                  takeUntilDestroyed(this.destroyRef)
                  ).subscribe(() => {
                    this.successMessage = '';
                   
                });
              

            },
            error: (error) => {
              if (error.error.validationErrors) {
                const nameError = error.error.validationErrors['name'];
                const codeError = error.error.validationErrors['code'];
                const emailError = error.error.validationErrors['email'];
                const mobileError = error.error.validationErrors['mobile'];
                if (nameError) {
                    this.storeCreateForm.controls['name'].setErrors({ server: nameError });
                }
                 if (codeError) {
                    this.storeCreateForm.controls['code'].setErrors({ server: codeError });
                }
                 if (emailError) {
                    this.storeCreateForm.controls['email'].setErrors({ server: emailError });
                }
                if (mobileError) {
                    this.storeCreateForm.controls['mobile'].setErrors({ server: mobileError });
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
      const nameValue = this.storeCreateForm.get('name')?.value || '';
      const code = this.formService.getUserInitials(nameValue)   // Trim leading/trailing hyphens
     
      
      this.storeCreateForm.get('code')?.setValue(code, { emitEvent: false });
   }

  // Progress helpers (mirrors user-create behavior for dynamic progress UI)
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
    const validFields = fields.filter(field => this.storeCreateForm.get(field)?.valid).length;
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
    const validFields = allFields.filter(field => this.storeCreateForm.get(field)?.valid).length;
    return Math.round((validFields / allFields.length) * 100);
  }
}

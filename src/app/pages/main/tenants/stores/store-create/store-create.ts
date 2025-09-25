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
}

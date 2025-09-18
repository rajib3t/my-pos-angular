import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../../services/tenant.service';
import { timer } from 'rxjs';
import { LucideAngularModule, SquarePlus, LayoutList } from 'lucide-angular';
import { RouterModule , Router} from '@angular/router';
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
  private destroyRef = inject(DestroyRef);
  constructor(
      private fb: FormBuilder,
      private tenantService: TenantService,
      private router: Router
  ) {
     this.tenantForm = this.fb.group({
        name: ['', Validators.required],
        subdomain: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$')]], // Alphanumeric and hyphens only
        // Add more form controls as needed
     });
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
                 this.successMessage = 'Tenant created successfully!';
                 this.tenantForm.reset();
                 this.isSubmitting = false;
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
                     if (nameError) {
                        this.tenantForm.controls['name'].setErrors({ server: nameError });
                     } else if (subdomainError) {
                        this.tenantForm.controls['subdomain'].setErrors({ server: subdomainError });
                     } else {
                        this.errorMessage = 'Failed to create tenant. Please check the form for errors.';
                     }
                     this.isSubmitting = false;
                     timer(5000).pipe(
                        takeUntilDestroyed(this.destroyRef)
                     ).subscribe(() => {
                        this.errorMessage = '';
                     });
                  }else{
                     this.errorMessage = 'Failed to create tenant. Please try again.';
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
}


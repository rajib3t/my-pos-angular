import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../../services/tenant.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-create',
  imports: [
     CommonModule,
    ReactiveFormsModule,

  ],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class CreateTenant implements OnInit {
  tenantForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
  private destroyRef = inject(DestroyRef);
  constructor(
     private fb: FormBuilder,
      private tenantService: TenantService,
  ) {
     this.tenantForm = this.fb.group({
        name: ['', Validators.required],
        subdomain: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$')]], // Alphanumeric and hyphens only
        // Add more form controls as needed
     });
  }

  ngOnInit(): void {
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
                 this.errorMessage = 'Failed to create tenant. Please try again.';
                 this.isSubmitting = false;
                 timer(3000).pipe(
                  takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                  this.errorMessage = '';
                });
              }
           });
     } else {
        this.errorMessage = 'Please correct the errors in the form.';
        this.successMessage = null;
     }
  }
}


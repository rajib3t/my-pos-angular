import { Component, Input, Output, EventEmitter, OnInit, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../../../../services/tenant.service';
import { FormService, FormChangeTracker } from '../../../../services/form.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { LucideAngularModule , LayoutList, SquarePen, Users} from 'lucide-angular';
@Component({
  selector: 'app-tenant-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.css'],
   imports: [
     CommonModule,
     ReactiveFormsModule,
     RouterModule,
     LucideAngularModule
   ]
 ,

})
export class EditTenant implements OnInit {
  readonly HouseIcon = LayoutList;
  readonly EditIcon = SquarePen;
  @Input() tenant: Tenant | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  
  // Form change tracking
  private destroyRef = inject(DestroyRef);
  private formChangeTracker?: FormChangeTracker;
  hasUnsavedChanges = false;
  
  tenantId: string | null = null;
  tenantForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
 

 
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private tenantService: TenantService,
    private formService: FormService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.tenantForm = this.fb.group({
      name: ['', Validators.required],
      subdomain: ['', Validators.required],
    });
  }

 ngOnInit() {
   // Get tenantId from URL
   this.activatedRoute.paramMap.subscribe(params => {
     this.tenantId = params.get('id');
   });
    if (this.tenantId) {
      this.loading = true;
      this.tenantService.getTenantById(this.tenantId).subscribe({
        next: (tenant) => {
          this.tenant = tenant;
          this.tenantForm.patchValue(tenant);
          this.setupFormChangeDetection(tenant);
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.message || 'Failed to load tenant';
          this.loading = false;
        }
      });
   }
  
 }
  ngOnChanges() {
    if (this.tenant) {
      this.tenantForm.patchValue(this.tenant);
      this.setupFormChangeDetection(this.tenant);
    }
  }

  private setupFormChangeDetection(originalValues: any): void {
    // Clean up existing tracker if it exists
    if (this.formChangeTracker) {
      this.formChangeTracker.destroy();
    }

    // Create new form change tracker
    this.formChangeTracker = this.formService.createFormChangeTracker({
      form: this.tenantForm,
      originalValues: this.formService.createSnapshot(originalValues),
      destroyRef: this.destroyRef,
      onChangeCallback: (hasChanges: boolean) => {
        this.hasUnsavedChanges = hasChanges;
      }
    });
  }

  private resetFormChanges(): void {
    if (this.formChangeTracker) {
      this.formChangeTracker.resetChanges();
    }
    this.hasUnsavedChanges = false;
  }

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Are you sure you want to leave without saving?');
    }
    return true;
  }

  onSubmit() {
    if (this.tenantForm.invalid) return;
    this.loading = true;
    this.error = null;
    if (!this.tenant?.subdomain) {
      this.error = 'Subdomain is required for update.';
      this.loading = false;
      return;
    }
    this.tenantService.updateTenant(this.tenantId as string, {
      ...this.tenant,
      ...this.tenantForm.value
    }).subscribe({
      next: (updatedTenant: Partial<Tenant>) => {
        this.loading = false;
        this.resetFormChanges(); // Reset form changes after successful save
        
        this.save.emit(updatedTenant);
        this.successMessage = 'Tenant updated successfully.';
        timer(3000).pipe(
                  takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                  this.successMessage = '';
                });
        // Optionally navigate away or reset form state here
        // this.router.navigate(['/tenants']); 
        // or
        // this.tenantForm.markAsPristine();
      },
      error: (err: any) => {

         if (err.error.validationErrors) {
          // Handle validation errors
          const validationErrors = err.error.validationErrors;
          Object.keys(validationErrors).forEach(field => {
            const control = this.tenantForm.get(field);
            if (control) {
              control.setErrors({ server: validationErrors[field] });
            }
          });
         }else{
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Update failed'; 
          timer(3000).pipe(
                    takeUntilDestroyed(this.destroyRef)
                  ).subscribe(() => {
                    this.errorMessage = '';
                  });
         }
        
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }


   gotoTenantList() {
      // Implement navigation to tenant list page
      this.router.navigate(['/tenants']);
   }

  gotoTenantUsers() {
      // Implement navigation to tenant users page
      if (this.tenantId) {
        this.router.navigate([`/tenants/${this.tenantId}/users`]);
      }
   }
}

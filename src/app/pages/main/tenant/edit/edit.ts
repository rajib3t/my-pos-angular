import { Component, Input, Output, EventEmitter, OnInit, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../../../../services/tenant.service';
import { FormService, FormChangeTracker } from '../../../../services/form.service';
import { CommonModule } from '@angular/common';

import { RouterModule, Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-tenant-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.css'],
   imports: [
     CommonModule,
     ReactiveFormsModule,
     RouterModule
   ]
 ,

})
export class EditTenant implements OnInit {
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
    this.tenantService.updateTenantSetting(this.tenant.subdomain, {
      ...this.tenant,
      ...this.tenantForm.value
    }).subscribe({
      next: (updatedTenant: Tenant) => {
        this.loading = false;
        this.resetFormChanges(); // Reset form changes after successful save
        this.save.emit(updatedTenant);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.message || 'Update failed';
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}

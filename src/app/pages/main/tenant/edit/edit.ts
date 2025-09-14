import { Component, Input, Output, EventEmitter , OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { TenantService, Tenant } from '../../../../services/tenant.service'
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-tenant-edit',
  templateUrl: './edit.html',
  styleUrls: ['./edit.css'],
   imports: [
     CommonModule,
     ReactiveFormsModule
   ]
 ,

})
export class EditTenant implements OnInit {
  @Input() tenant: Tenant | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  editForm: FormGroup;

 
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private tenantService: TenantService) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      subdomain: ['', Validators.required],
      databaseName: ['', Validators.required],
      databaseUser: ['', Validators.required]
    });
  }

 ngOnInit() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      subdomain: ['', Validators.required],
      databaseName: ['', Validators.required],
      databaseUser: ['', Validators.required]
    });
  }
  ngOnChanges() {
    if (this.tenant) {
      this.editForm.patchValue(this.tenant);
    }
  }

  onSubmit() {
    if (this.editForm.invalid) return;
    this.loading = true;
    this.error = null;
    if (!this.tenant?.subdomain) {
      this.error = 'Subdomain is required for update.';
      this.loading = false;
      return;
    }
    this.tenantService.updateTenantSetting(this.tenant.subdomain, {
      ...this.tenant,
      ...this.editForm.value
    }).subscribe({
      next: (updatedTenant: Tenant) => {
        this.loading = false;
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

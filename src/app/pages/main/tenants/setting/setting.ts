import { Component , OnInit, DestroyRef, inject} from '@angular/core';
import { TenantSettingResponse, TenantService } from '@/app/services/tenant.service';
import { UiService } from '@/app/services/ui.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uppercaseValidator } from  '@/app/validators/uppercase.validator'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormService, FormChangeTracker } from '@/app/services/form.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-setting',
  imports: [
      CommonModule,
      ReactiveFormsModule,
  ],
  templateUrl: './setting.html',
  styleUrl: './setting.css'
})
export class TenantSetting implements OnInit {
  settingForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isChangingInfo = false;
  isLoading = true;
  tenant: TenantSettingResponse | null = null;

  // Form change tracker from service
  formTracker!: FormChangeTracker;
  private destroyRef = inject(DestroyRef);
  constructor(
    private tenantService: TenantService,
    private uiService: UiService,
    private fb: FormBuilder,
    private formService: FormService,
  ) {
    this.settingForm = this.fb.group({
    shopName: ['', Validators.required],
    code: ["", [Validators.required, uppercaseValidator()]] ,
    address: [''],
    address2: [''],
    city: [''],
    state: [''],
    country: [''],
    zipCode: [''],
    currency: [''],
    phone: [''],
    email: [''],
    logoUrl: [''],
    fassi: [''],
    gstNumber: [''],
    sgst: ['', Validators.pattern('^\\d*(\\.\\d+)?$')],
    cgst: ['', Validators.pattern('^\\d*(\\.\\d+)?$')]
    });
  }

  ngOnInit(): void {
    const subdomain = this.uiService.getSubDomain();
    if (subdomain) {
      this.tenantService.getTenantSetting(subdomain).pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (tenant) => {
          this.tenant = tenant;
          this.settingForm.patchValue({
            shopName: tenant.shopName || '',
            code: tenant?.code || "",
            address: tenant.address1 || '',
            address2: tenant.address2 || '',
            city: tenant.city || '',
            state: tenant.state || '',
            country: tenant.country || '',
            zipCode: tenant.zipCode || '',
            currency: tenant.currency || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            logoUrl: tenant.logoUrl || '',
            fassi: tenant.fassi || '',
            gstNumber: tenant.gstNumber || '',
            sgst: tenant.sgst || '',
            cgst: tenant.cgst || ''
          });
          
          // Prepare original values for form tracker
          const originalValues = {
            shopName: tenant.shopName || '',
            code: tenant?.code || "",
            address: tenant.address1 || '',
            address2: tenant.address2 || '',
            city: tenant.city || '',
            state: tenant.state || '',
            country: tenant.country || '',
            zipCode: tenant.zipCode || '',
            currency: tenant.currency || '',
            phone: tenant.phone || '',
            email: tenant.email || '',
            logoUrl: tenant.logoUrl || '',
            fassi: tenant.fassi || '',
            gstNumber: tenant.gstNumber || '',
            sgst: tenant.sgst || '',
            cgst: tenant.cgst || ''
          };

          // Setup form change tracking using FormService
          this.formTracker = this.formService.createFormChangeTracker({
            form: this.settingForm,
            originalValues: originalValues,
            destroyRef: this.destroyRef,
            onChangeCallback: (hasChanges: boolean) => {
              this.isChangingInfo = hasChanges;
            }
          });

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching tenant settings:', error);
        }
      });
    } else {
      console.error('No subdomain found in the URL.');
    }
  }

  onSubmit(): void {

    if(this.settingForm.invalid) {
      console.error('Validation error');
      this.isSubmitting = false;
      return;
    }
    const subdomain = this.uiService.getSubDomain();
    if (!subdomain) {
      console.error('No subdomain found in the URL.');
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    // Check if form has changes using the form tracker
    if (!this.formTracker || !this.formTracker.hasChanges) {
      this.isSubmitting = false;
      return;
    }

    // Get only the changed fields using form tracker utility
    const currentValues = this.settingForm.value;
    const changedFields: Record<string, any> = {};

    // Since we're using FormService, we can get changed fields by comparing with form tracker
    // For now, let's send all current non-empty values when there are changes
    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== null && currentValues[key] !== undefined && String(currentValues[key]).trim() !== '') {
        changedFields[key] = currentValues[key];
      }
    });

    // Always include shopName as it's required
    changedFields['shopName'] = this.settingForm.value.shopName;
    this.tenantService.updateTenantSetting(subdomain, changedFields as any).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updateSettings) => {
        // Update local user data
        this.tenant = updateSettings;
        
        // Update form tracker with new original values
        if (updateSettings) {
          const newOriginalValues = {
            shopName: updateSettings.shopName || '',
            code: updateSettings?.code || "",
            address: updateSettings.address1 || '',
            address2: updateSettings.address2 || '',
            city: updateSettings.city || '',
            state: updateSettings.state || '',
            country: updateSettings.country || '',
            zipCode: updateSettings.zipCode || '',
            currency: updateSettings.currency || '',
            phone: updateSettings.phone || '',
            email: updateSettings.email || '',
            logoUrl: updateSettings.logoUrl || '',
            fassi: updateSettings.fassi || '',
            gstNumber: updateSettings.gstNumber || '',
            sgst: updateSettings.sgst || '',
            cgst: updateSettings.cgst || ''
          };
          
          this.settingForm.patchValue(newOriginalValues);
          this.formTracker.updateOriginalValues(newOriginalValues);
        }
        
        this.isSubmitting = false;
        this.isChangingInfo = false;
        this.successMessage = 'Settings updated successfully!';
        timer(3000).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          this.successMessage = '';
        });
      },
          error: (error) => {
            this.isSubmitting = false;
            if (error.error.validationErrors) {
                const emailError = error.error.validationErrors['email'];
                const phoneError = error.error.validationErrors['phone'];
                const codeError = error.error.validationErrors['code'];
                const shopNameError = error.error.validationErrors['shopName'];
                const addressError = error.error.validationErrors['address'];
                const cityError = error.error.validationErrors['city'];
                const stateError = error.error.validationErrors['state'];
                const zipCodeError = error.error.validationErrors['zipCode'];
                const currencyError = error.error.validationErrors['currency'];
                const gstNumberError = error.error.validationErrors['gstNumber'];
                const sgstError = error.error.validationErrors['sgst'];
                const cgstError = error.error.validationErrors['cgst'];
                // Display field-specific errors in your form
                if(emailError){
                  this.settingForm.controls['email'].setErrors({ server: emailError });
                }

                if(phoneError){
                  this.settingForm.controls['phone'].setErrors({ server: phoneError });
                }

                if(codeError){
                  this.settingForm.controls['code'].setErrors({ server: codeError });
                }

                if(shopNameError){
                  this.settingForm.controls['shopName'].setErrors({ server: shopNameError });
                }
                if(addressError){
                  this.settingForm.controls['address'].setErrors({ server: addressError });
                }
                if(cityError){
                  this.settingForm.controls['city'].setErrors({ server: cityError });
                }
                if(stateError){
                  this.settingForm.controls['state'].setErrors({ server: stateError });
                }
                if(zipCodeError){
                  this.settingForm.controls['zipCode'].setErrors({ server: zipCodeError });
                }
                if(currencyError){
                  this.settingForm.controls['currency'].setErrors({ server: currencyError });
                }
                if(gstNumberError){
                  this.settingForm.controls['gstNumber'].setErrors({ server: gstNumberError });
                }
                if(sgstError){
                  this.settingForm.controls['sgst'].setErrors({ server: sgstError });
                }
                if(cgstError){
                  this.settingForm.controls['cgst'].setErrors({ server: cgstError });
                }
            }else{
              console.error('Error updating profile:', error);
              this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
              
              timer(3000).pipe(
                takeUntilDestroyed(this.destroyRef)
              ).subscribe(() => {
                this.errorMessage = '';
              });
            }
            
          }
        });
  }


}

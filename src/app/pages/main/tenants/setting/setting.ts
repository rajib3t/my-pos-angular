import { Component , OnInit, DestroyRef, inject} from '@angular/core';
import { TenantSettingResponse, TenantService } from '@/app/services/tenant.service';
import { UiService } from '@/app/services/ui.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uppercaseValidator } from  '@/app/validators/uppercase.validator'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private originalValues: Record<string, any> = {};
  private destroyRef = inject(DestroyRef);
  constructor(
    private tenantService: TenantService,
    private uiService: UiService,
    private fb: FormBuilder
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
          
          // Store original values for change detection
          this.originalValues = { ...this.settingForm.value };
          this.isLoading = false;
          
          this.setupFormChangeDetection();
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
    // Check originalValues
    if (!this.originalValues || Object.keys(this.originalValues).length === 0) {
      console.error('Original values not set properly');
      this.isSubmitting = false;
      return;
    }
    const currentValues = this.settingForm.value;
    const changedFields: Record<string, any> = {};

    // Compare current values with original values using normalized strings
    Object.keys(currentValues).forEach(key => {
      const currentValue = this.normalizeValue(currentValues[key]);
      const originalValue = this.normalizeValue(this.originalValues[key]);

      

      if (currentValue !== originalValue) {
        
        changedFields[key] = currentValues[key];
      }
    });
     // Nothing changed
    if (Object.keys(changedFields).length === 0) {
      this.isSubmitting = false;
      

      // fallback: show what would be sent if you wanted to send non-empty fields
      const nonEmptyFields: Record<string, any> = {};
      Object.keys(currentValues).forEach(key => {
        if (currentValues[key] !== null && currentValues[key] !== undefined && String(currentValues[key]).trim() !== '') {
          nonEmptyFields[key] = currentValues[key];
        }
      });

     
      return;
    }
    changedFields['shopName'] = this.settingForm.value.shopName;
    this.tenantService.updateTenantSetting(subdomain, changedFields as any).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updateSettings) => {
        // Update local user data and original values
        this.tenant = updateSettings;
        this.originalValues = { ...this.settingForm.value };
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



  private setupFormChangeDetection(): void {
    // Listen to form value changes
    this.settingForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkForChanges();
    });
  }
  private normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private checkForChanges(): void {
    if (!this.tenant || !this.originalValues || Object.keys(this.originalValues).length === 0) {
      this.isChangingInfo = false;
      return;
    }

    const currentValues = this.settingForm.value;
    let hasChanges = false;

    // Compare current values with original values using normalized strings
    Object.keys(currentValues).forEach(key => {
      const currentValue = this.normalizeValue(currentValues[key]);
      const originalValue = this.normalizeValue(this.originalValues[key]);

      if (currentValue !== originalValue) {
        hasChanges = true;
      }
    });

    this.isChangingInfo = hasChanges;
  }



}

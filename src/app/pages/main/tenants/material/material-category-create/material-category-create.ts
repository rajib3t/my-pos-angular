import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { TenantService, TenantSettingResponse } from '@/app/services/tenant.service';
import { UiService } from '@/app/services/ui.service';
@Component({
  selector: 'app-material-category-create',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './material-category-create.html',
  styleUrl: './material-category-create.css'
})
export class MaterialCategoryCreate implements OnInit {
  categoryForm : FormGroup
  isSubmitting = '' ;
  errorMessage = '';
  successMessage = '';
  isChangingInfo = false;
  tenantSettings: TenantSettingResponse | null = null;
  private originalValues: Record<string, any> = {};
  private destroyRef = inject(DestroyRef);
  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private uiService: UiService,
    public router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ["", Validators.required],
      code: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.setupFormChangeDetection();
    this.setupNameChangeListener();
    this.loadTenantSettings();
  }

  onSubmit(): void {

  }


  private setupFormChangeDetection(): void {
    // Listen to form value changes
    this.categoryForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkForChanges();
    });
  }

  private setupNameChangeListener(): void {
    // Listen to name field changes and auto-generate code
    this.categoryForm.get('name')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((name: string) => {
      if (name && name.trim()) {
        const generatedCode = this.generateSettingCode(name.trim());
        this.categoryForm.get('code')?.setValue(generatedCode, { emitEvent: false });
      }
    });
  }

  private loadTenantSettings(): void {
    const subdomain = this.uiService.getSubDomain();
    if (subdomain) {
      this.tenantService.getTenantSetting(subdomain).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (settings: TenantSettingResponse) => {
          this.tenantSettings = settings;
          // If there's already a name in the form, regenerate the code with the new prefix
          const currentName = this.categoryForm.get('name')?.value;
          if (currentName && currentName.trim()) {
            const generatedCode = this.generateSettingCode(currentName.trim());
            this.categoryForm.get('code')?.setValue(generatedCode, { emitEvent: false });
          }
        },
        error: (error: any) => {
          console.error('Error fetching tenant settings:', error);
        }
      });
    }
  }

  private generateSettingCode(name: string): string {
    // Remove extra spaces and split by space
    const words = name.trim().split(/\s+/).filter(word => word.length > 0);
    
    let categoryCode = '';
    if (words.length === 1) {
      // Single word: get first 2 letters
      categoryCode = words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words: get first letter of every word
      categoryCode = words.map(word => word.charAt(0)).join('').toUpperCase();
    }
    
    // Add tenant prefix if available
    const tenantPrefix = this.tenantSettings?.code || '';
    return tenantPrefix ? `${tenantPrefix}-${categoryCode}` : categoryCode;
  }
  private normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private checkForChanges(): void {
    if ( !this.originalValues || Object.keys(this.originalValues).length === 0) {
      this.isChangingInfo = false;
      return;
    }

    const currentValues = this.categoryForm.value;
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


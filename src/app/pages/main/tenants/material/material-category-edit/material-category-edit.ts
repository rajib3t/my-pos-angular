import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, DestroyRef, effect } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IMaterialCategory, MaterialService } from '@/app/services/material.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { appState } from '@/app/state/app.state';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { UiService } from '@/app/services/ui.service';


@Component({
  selector: 'app-material-category-edit',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './material-category-edit.html',
  styleUrl: './material-category-edit.css'
})
export class MaterialCategoryEdit implements OnInit {
  private destroyRef = inject(DestroyRef);
  categoryForm!: FormGroup;
  categoryId = signal<string | null>(null);
  storeId = signal<string | null>(null);
  materialCategory = signal<IMaterialCategory | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isChangingInfo = signal<boolean>(false);
  private originalValues: Record<string, any> = {};
  
  readonly router = inject(Router);

  constructor(
    private activatedRoute: ActivatedRoute,
    private materialService: MaterialService,
    private fb: FormBuilder,
    private uiService: UiService
  ) {
    this.initForm();
    this.setupStoreEffect();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: [{ value: '', disabled: true }]
    });
  }

  private setupStoreEffect(): void {
    const storeEffect = effect(() => {
      const store = appState.store;
      const newStoreID = store?._id || null;

      // Only reload if storeID actually changed
      if (newStoreID && newStoreID !== this.storeId()) {
        this.storeId.set(newStoreID);
        
        // If we have a category ID waiting, load it now
        const categoryId = this.categoryId();
        if (categoryId) {
          this.loadMaterialCategory(categoryId);
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      storeEffect.destroy();
    });
  }

  private loadCategoryFromRoute(): void {
    // Subscribe to route params only once
    this.activatedRoute.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const categoryId = params.get('categoryId');

      if (categoryId && categoryId !== this.categoryId()) {
        this.categoryId.set(categoryId);
        
        // Only load if we have a storeId
        const storeId = this.storeId();
        if (storeId) {
          this.loadMaterialCategory(categoryId);
        }
        // Otherwise, wait for storeId to be set via the effect
      } else if (!categoryId) {
        this.categoryId.set(null);
        this.materialCategory.set(null);
      }
    });
  }

  private loadMaterialCategory(categoryId: string): void {
    const storeId = this.storeId();
    
    if (!storeId) {
      this.errorMessage.set('Store ID not found');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.materialService.getById(storeId, categoryId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (category) => {
        this.materialCategory.set(category);
        this.populateForm(category);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading material category:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to load material category');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(category: IMaterialCategory): void {
    console.log(category);
    
    const originalValues = {
      name: category.name || '',
      code: category.code || ''
    };
    
    // Save original values for change tracking
    this.originalValues = originalValues;
    
    this.categoryForm.patchValue(originalValues);
    
    // Setup form change detection
    this.setupFormChangeDetection();
    
    // Mark form as pristine after initial load
    this.categoryForm.markAsPristine();
  }

  private setupFormChangeDetection(): void {
    // Listen to form value changes
    this.categoryForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkForChanges();
    });
  }

  private normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  private checkForChanges(): void {
    if (!this.originalValues || Object.keys(this.originalValues).length === 0) {
      this.isChangingInfo.set(false);
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

    this.isChangingInfo.set(hasChanges);
  }

  onSubmit(): void {
    if (this.categoryForm.invalid || !this.categoryForm.dirty) {
      return;
    }

    const categoryId = this.categoryId();
    const storeId = this.storeId();

    if (!categoryId || !storeId) {
      this.errorMessage .set('Store ID or Category ID not found');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage .set(null);

    const updateData = {
      name: this.categoryForm.get('name')?.value
    };

    this.materialService.update(storeId, categoryId, updateData).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updatedCategory) => {
        this.materialCategory.set(updatedCategory);
        this.successMessage.set('Material category updated successfully!');
        this.uiService.success(this.successMessage() ?? '', 'Update', 2000);
        this.isSubmitting.set(false);
        this.categoryForm.markAsPristine();
        
        // Navigate back after a short delay
        timer(1500).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          this.router.navigate(['/tenants', storeId, 'material-categories']);
        });
      },
      error: (error) => {
        console.error('Error updating material category:', error);
        this.isSubmitting .set(false);
        
        // Handle validation errors
        if (error?.error?.validationErrors) {
          const nameError = error.error.validationErrors['name'];
          if (nameError) {
            this.categoryForm.controls['name'].setErrors({ server: nameError });
            this.uiService.error(nameError, 'Update', 2000);
          }
          
          timer(5000).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe(() => {
            this.errorMessage
          });
        } else {
          this.errorMessage = error?.error?.message || 'Failed to update material category';
          this.uiService.error(this.errorMessage() || 'Something went wrong', 'Update', 2000);

          timer(5000).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe(() => {
            this.errorMessage.set('');
          });
        }
      }
    });
  }

  onCancel(): void {
    const storeId = this.storeId();
    if (storeId) {
      this.router.navigate(['/tenants', storeId, 'material-categories']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Initial load: if store is already set in app state, set store ID
    const currentStore = appState.store;
    if (currentStore?._id && !this.storeId()) {
      this.storeId.set(currentStore._id);
    }
    
    // Now setup route subscription after we've tried to set storeId
    this.loadCategoryFromRoute();
  }
}

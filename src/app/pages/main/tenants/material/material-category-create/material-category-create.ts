import { Component, DestroyRef, inject, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { TenantService, TenantSettingResponse } from '@/app/services/tenant.service';
import { UiService } from '@/app/services/ui.service';
import { appState } from '@/app/state/app.state';
import { MaterialService } from '@/app/services/material.service';

@Component({
  selector: 'app-material-category-create',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './material-category-create.html',
  styleUrl: './material-category-create.css'
})
export class MaterialCategoryCreate implements OnInit {
  categoryForm : FormGroup
  isSubmitting : boolean = false ;
  errorMessage : string | null = null;
  successMessage : string | null = null;
  isChangingInfo = false;
  tenantSettings: TenantSettingResponse | null = null;
  storeID = signal<string | null>(null);
  private originalValues: Record<string, any> = {};
  private destroyRef = inject(DestroyRef);
  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private uiService: UiService,
    public router: Router,
    private materialService : MaterialService
  ) {

    this.setupStoreEffect()
    
   
    this.categoryForm = this.fb.group({
      name: ["", Validators.required],
      code: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.setupFormChangeDetection();
    this.setupNameChangeListener();
    
    // Initial load: if store is already set in app state, load tenant settings
    const currentStore = appState.store;
    if (currentStore?._id && !this.storeID()) {
      this.storeID.set(currentStore._id);
      this.loadTenantSettings(currentStore._id);
    }
  }

   private setupStoreEffect(): void {
    const storeEffect = effect(() => {
      const store = appState.store;
      const newStoreID = store?._id || null;

      // Only reload if storeID actually changed
      if (newStoreID && newStoreID !== this.storeID()) {
        this.storeID.set(newStoreID);
        this.loadTenantSettings(newStoreID);
      }
    });

    this.destroyRef.onDestroy(() => {
      storeEffect.destroy();
    });
  }

  onSubmit(): void {
     if (this.categoryForm.valid) {
          this.isSubmitting = true;
          this.errorMessage = null;
          this.successMessage = null
          this.materialService.create(this.storeID() as string, this.categoryForm.value).pipe(
             takeUntilDestroyed(this.destroyRef)
          ).subscribe({
            next:(data)=>{
              this.isSubmitting = false;
              this.successMessage = 'Materials category create successfully'
              this.uiService.success(this.successMessage, 'Create', 2000)
              this.categoryForm.reset();
              timer(3000).pipe(
                takeUntilDestroyed(this.destroyRef)
              ).subscribe(() => {
                this.successMessage = '';
              });
            },
            error:(error)=>{
               this.isSubmitting = false;
              if (error.error.validationErrors) {
                const nameError = error.error.validationErrors['name'];
                const codeError = error.error.validationErrors['code'];
                if (nameError) {
                    this.categoryForm.controls['name'].setErrors({ server: nameError });
                    this.uiService.error(nameError, 'Create', 2000)
                }
                 if (codeError) {
                    this.categoryForm.controls['code'].setErrors({ server: codeError });
                    this.uiService.error(codeError, 'Create', 2000)
                }
               
                timer(5000).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                    this.errorMessage = '';
                });
                
              }else{
                 timer(5000).pipe(
                    takeUntilDestroyed(this.destroyRef)
                ).subscribe(() => {
                    this.errorMessage = 'Something went wrong, please try again';
                });
                this.uiService.error('Something went wrong, please try again', 'Create', 2000)
              }
            }
          })

     }

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

  private loadTenantSettings(storeID: string): void {
     
      
    
      this.tenantService.getTenantSetting(storeID).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (settings: TenantSettingResponse) => {
            console.log(settings);
            
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

  private generateSettingCode(name: string) {
    // Remove extra spaces and split by space
    const words = name.trim();

    this.materialService.generateCode(this.storeID() as string, words).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
       
        
        if (response && response) {
          this.categoryForm.get('code')?.setValue(response, { emitEvent: false });
        }
      },
      error: (error) => {
        console.error('Error generating code:', error);
      }
    });

  

    
    // Take the first letter of each word and convert to uppercas
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


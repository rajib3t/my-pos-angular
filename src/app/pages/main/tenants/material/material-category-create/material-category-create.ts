import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
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
  private originalValues: Record<string, any> = {};
  private destroyRef = inject(DestroyRef);
  constructor(
    private fb: FormBuilder,
  ) {
    this.categoryForm = this.fb.group({
      name: ["", Validators.required],
      code: ["", Validators.required],
    });
  }

  ngOnInit() {
    this.setupFormChangeDetection();
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


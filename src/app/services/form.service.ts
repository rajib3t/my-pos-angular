import { Injectable, DestroyRef, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, BehaviorSubject } from 'rxjs';
import {AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export interface FormChangeDetectionConfig {
  form: FormGroup;
  originalValues?: any;
  destroyRef?: DestroyRef;
  onChangeCallback?: (hasChanges: boolean) => void;
}

export interface FormChangeTracker {
  hasChanges$: Observable<boolean>;
  hasChanges: boolean;
  updateOriginalValues: (values: any) => void;
  resetChanges: () => void;
  destroy: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  
  /**
   * Creates a change detection tracker for any form
   * @param config Configuration object containing form, original values, and optional callbacks
   * @returns FormChangeTracker object with methods and observables for tracking changes
   */
  createFormChangeTracker(config: FormChangeDetectionConfig): FormChangeTracker {
    const { form, originalValues = {}, destroyRef, onChangeCallback } = config;
    
    const hasChangesSubject = new BehaviorSubject<boolean>(false);
    let currentOriginalValues = { ...originalValues };
    let subscription: any;

    const normalizeValue = (value: any): string => {
      return value === null || value === undefined ? '' : String(value).trim();
    };

    const checkForChanges = (): void => {
      if (!currentOriginalValues || Object.keys(currentOriginalValues).length === 0) {
        hasChangesSubject.next(false);
        return;
      }

      const currentValues = form.value;
      let hasChanges = false;

      // Compare current values with original values using normalized strings
      Object.keys(currentValues).forEach(key => {
        const currentValue = normalizeValue(currentValues[key]);
        const originalValue = normalizeValue(currentOriginalValues[key]);

        if (currentValue !== originalValue) {
          hasChanges = true;
        }
      });

      hasChangesSubject.next(hasChanges);
      
      // Call optional callback
      if (onChangeCallback) {
        onChangeCallback(hasChanges);
      }
    };

    const setupFormChangeDetection = (): void => {
      const takeUntil = destroyRef ? takeUntilDestroyed(destroyRef) : null;
      
      if (takeUntil) {
        subscription = form.valueChanges.pipe(takeUntil).subscribe(() => {
          checkForChanges();
        });
      } else {
        subscription = form.valueChanges.subscribe(() => {
          checkForChanges();
        });
      }
    };

    const updateOriginalValues = (values: any): void => {
      currentOriginalValues = { ...values };
      checkForChanges(); // Recheck after updating original values
    };

    const resetChanges = (): void => {
      hasChangesSubject.next(false);
    };

    const destroy = (): void => {
      if (subscription) {
        subscription.unsubscribe();
      }
      hasChangesSubject.complete();
    };

    // Initialize change detection
    setupFormChangeDetection();

    return {
      hasChanges$: hasChangesSubject.asObservable(),
      get hasChanges() {
        return hasChangesSubject.value;
      },
      updateOriginalValues,
      resetChanges,
      destroy
    };
  }

  /**
   * Utility method to normalize values for comparison
   * @param value Any value to normalize
   * @returns Normalized string value
   */
  normalizeValue(value: any): string {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  /**
   * Utility method to create a deep copy of form values
   * @param formValue Form value object
   * @returns Deep copy of the form values
   */
  createSnapshot(formValue: any): any {
    return JSON.parse(JSON.stringify(formValue));
  }

  /**
   * Utility method to check if two form values are equal
   * @param value1 First value to compare
   * @param value2 Second value to compare
   * @returns Boolean indicating if values are equal
   */
  areValuesEqual(value1: any, value2: any): boolean {
    const normalizedValue1 = this.normalizeValue(value1);
    const normalizedValue2 = this.normalizeValue(value2);
    return normalizedValue1 === normalizedValue2;
  }


  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!confirmPassword) return null; // Don't show error if confirmPassword is empty
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty values
    }
    const onlyUppercase = /^[A-Z]*$/.test(value); // Regex for only uppercase letters
    return onlyUppercase ? null : { 'uppercaseOnly': { value: control.value } };
  };
}


getUserInitials(name: string): string {
      if (!name) return '';
      
      const words = name
          .trim()
          .split(/[\s-]+/) // Split by spaces and hyphens
          .filter(word => word.length > 0);
      
      if (words.length === 1) {
          // Single word - return first two characters
          return words[0].substring(0, 2).toUpperCase();
      } else {
          // Multiple words - return first letter of each word
          return words
              .map(word => word.charAt(0).toUpperCase())
              .join('');
      }
  }
}

# Generic Form Change Detection Service

This service provides a reusable solution for detecting changes in Angular reactive forms across your application.

## Features

- **Generic**: Works with any FormGroup
- **Reactive**: Provides Observable streams for change detection
- **Memory Safe**: Handles cleanup automatically with DestroyRef
- **Flexible**: Supports custom callbacks and configurations
- **Normalized Comparison**: Handles null/undefined values and trims strings for accurate comparison

## Quick Start

### 1. Basic Usage

```typescript
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormService, FormChangeTracker } from '../services/form.service';

export class MyComponent implements OnInit {
  form!: FormGroup;
  formTracker!: FormChangeTracker;
  
  private fb = inject(FormBuilder);
  private formService = inject(FormService);
  private destroyRef = inject(DestroyRef);
  
  originalData = { name: 'John', email: 'john@example.com' };

  ngOnInit(): void {
    // Initialize form
    this.form = this.fb.group({
      name: [this.originalData.name],
      email: [this.originalData.email]
    });

    // Setup change tracking
    this.formTracker = this.formService.createFormChangeTracker({
      form: this.form,
      originalValues: this.originalData,
      destroyRef: this.destroyRef
    });
  }

  // Check if form has changes
  get hasChanges(): boolean {
    return this.formTracker.hasChanges;
  }

  save(): void {
    if (this.formTracker.hasChanges) {
      const formValue = this.form.value;
      
      // Save logic here...
      
      // Update original values after successful save
      this.formTracker.updateOriginalValues(formValue);
    }
  }
}
```

### 2. With Callback

```typescript
this.formTracker = this.formService.createFormChangeTracker({
  form: this.settingForm,
  originalValues: this.tenant,
  destroyRef: this.destroyRef,
  onChangeCallback: (hasChanges: boolean) => {
    this.isChangingInfo = hasChanges; // Update your existing property
  }
});
```

### 3. Reactive Usage

```typescript
// Subscribe to change stream
this.formTracker.hasChanges$.subscribe(hasChanges => {
  if (hasChanges) {
    console.log('Form has unsaved changes');
  }
});
```

## API Reference

### FormService.createFormChangeTracker(config)

Creates a change tracker for a form.

**Parameters:**
- `config.form` (FormGroup): The form to track
- `config.originalValues` (any): Original values to compare against
- `config.destroyRef` (DestroyRef, optional): For automatic cleanup
- `config.onChangeCallback` (function, optional): Called when changes detected

**Returns:** FormChangeTracker

### FormChangeTracker

**Properties:**
- `hasChanges$`: Observable<boolean> - Stream of change status
- `hasChanges`: boolean - Current change status

**Methods:**
- `updateOriginalValues(values)`: Update the baseline values
- `resetChanges()`: Reset change status to false
- `destroy()`: Manual cleanup (usually not needed with DestroyRef)

### Utility Methods

```typescript
// Normalize values for comparison
this.formService.normalizeValue(value);

// Create deep copy of form values
this.formService.createSnapshot(formValue);

// Compare two values
this.formService.areValuesEqual(value1, value2);
```

## Migration from Existing Code

If you have existing form change detection like in your setting component, you can easily migrate:

**Before:**
```typescript
private setupFormChangeDetection(): void {
  this.settingForm.valueChanges.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => {
    this.checkForChanges();
  });
}
```

**After:**
```typescript
private setupFormChangeDetection(): void {
  this.formTracker = this.formService.createFormChangeTracker({
    form: this.settingForm,
    originalValues: this.tenant,
    destroyRef: this.destroyRef,
    onChangeCallback: (hasChanges) => {
      this.isChangingInfo = hasChanges;
    }
  });
}
```

## Best Practices

1. **Always provide DestroyRef** for automatic cleanup
2. **Update original values** after successful save operations
3. **Use the callback** to update existing component properties
4. **Use the Observable** for reactive UI updates
5. **Call updateOriginalValues()** when loading new data

## Example Use Cases

- **Settings Forms**: Track changes to user/tenant settings
- **Profile Forms**: Monitor profile updates
- **Edit Forms**: Prevent navigation with unsaved changes
- **Multi-step Forms**: Track changes across form steps
- **Dynamic Forms**: Handle forms with changing structure
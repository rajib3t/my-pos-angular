import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasUppercase = /[A-Z]/.test(control.value);
    return hasUppercase ? null : { noUppercase: true };
  };
}
import { Component, OnInit, inject , DestroyRef} from '@angular/core';
import { appState } from  '@/app/state/app.state'
import { LucideAngularModule,  Store as StoreIcon, Phone as PhoneIcon, AtSign as AtSignIcon} from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CommonModule} from '@angular/common'
import {FormService} from '@/app/services/form.service'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-first-store-create',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './first-store-create.html',
  styleUrl: './first-store-create.css'
})
export class FirstStoreCreate implements OnInit {
  readonly StoreIcon = StoreIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly AtSignIcon = AtSignIcon;
  isSubmitting = false
  firstStoreCreateForm : FormGroup
  private destroyRef = inject(DestroyRef);


  successMessage = ''
  errorMessage=''
  showFirstStoreCreate = false;


  constructor(
    private fb: FormBuilder,
    private formService : FormService
  
  ){
    this.firstStoreCreateForm = this.fb.group({
      name:['',  [Validators.required, Validators.minLength(8)]],
      code: ['', [Validators.required], this.formService.uppercaseValidator()],
      mobile:['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email:['', [Validators.required, Validators.minLength(10)], Validators.email],
      
    })
  }

  ngOnInit(): void {
    this.firstStoreCreateForm.get('name')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.onNameChange());
  }
    get isFirstStore() {
        return this.showFirstStoreCreate = appState.store === null;
        
      }

    onSubmit(): void{
      
    }
   
     onNameChange() {
      const nameValue = this.firstStoreCreateForm.get('name')?.value || '';
      const code = this.getUserInitials(nameValue)   // Trim leading/trailing hyphens
      console.log(code);
      
      this.firstStoreCreateForm.get('code')?.setValue(code, { emitEvent: false });
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

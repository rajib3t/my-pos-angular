import { Component } from '@angular/core';
import { appState } from  '@/app/state/app.state'
import { LucideAngularModule,  Store as StoreIcon, Phone as PhoneIcon, AtSign as AtSignIcon} from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CommonModule} from '@angular/common'
import {FormService} from '@/app/services/form.service'
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
export class FirstStoreCreate {
  readonly StoreIcon = StoreIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly AtSignIcon = AtSignIcon;
  isSubmitting = false
  firstStoreCreateForm : FormGroup
  

  successMessage = ''
  errorMessage=''
  showFirstStoreCreate = false;


  constructor(
    private fb: FormBuilder,
    private formService: FormService
  ){
    this.firstStoreCreateForm = this.fb.group({
      name:['',  [Validators.required, Validators.minLength(8)]],
      code: ['', [Validators.required, Validators.minLength(3)] ],
      mobile:['', [Validators.required, Validators.minLength(10)]],
      email:['', [Validators.required, Validators.minLength(10)], Validators.email],
      
    })
  }

    get isFirstStore() {
        return this.showFirstStoreCreate = appState.store === null;
        
      }

    onSubmit(): void{

    }
   
  
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule,User as UserIcon , Mail as MailIcon, LockKeyhole as LockKeyholeIcon, LayoutList , ShieldCheck} from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { timer } from 'rxjs';
import { UserService } from '@/app/services/user.service';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormService } from '@/app/services/form.service';

@Component({
  selector: 'app-tenant-user-create',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate implements OnInit {
  tenantId: string | null = null;
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly LockKeyholeIcon = LockKeyholeIcon;
  readonly HouseIcon = LayoutList;
  readonly ShieldCheckIcon = ShieldCheck;
  errorMessage: string | null = null;

  ngOnInit() {
     this.activatedRoute.paramMap.subscribe(params => {
     this.tenantId = params.get('id');
   });
  }
  successMessage: string | null = null;
  isSubmitting = false;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formService: FormService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: formService.passwordsMatchValidator });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.userForm.value;
    this.userService.createUser(formData, this.tenantId ?? '').subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'User created successfully!';
        this.userForm.reset();
        // Optionally, reset form validation states
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.setErrors(null);
        });
        // Clear success message after a delay
        timer(3000).subscribe(() => {
          this.successMessage = null;
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'An error occurred while creating the user.';
        // Clear error message after a delay
        timer(5000).subscribe(() => {
          this.errorMessage = null;
        });
      }
    });
  }

  get name() {
    return this.userForm.get('name');
  }

  get email() {
    return this.userForm.get('email');
  }

  get mobile() {
    return this.userForm.get('mobile');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  get role() {
    return this.userForm.get('role');
  }


  goToUserList() : void {
    this.router.navigate(['/tenants', this.tenantId, 'users']);
  
  }

  gotoTenantList(): void {
    this.router.navigate(['/tenants']);
  }
}

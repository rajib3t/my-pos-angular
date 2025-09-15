import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule,User as UserIcon , Mail as MailIcon, LockKeyhole as LockKeyholeIcon} from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { timer } from 'rxjs';
@Component({
  selector: 'app-user-create',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css'
})
export class UserCreate {
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly LockKeyholeIcon = LockKeyholeIcon;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;
}

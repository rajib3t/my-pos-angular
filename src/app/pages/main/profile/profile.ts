import { Component , OnInit, OnDestroy} from '@angular/core';
import { User, UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  private userSubscription!: Subscription;
  user: User | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userSubscription = this.userService.profileUserData.subscribe({
      next: (user) => {
        console.log('Received user profile data:', user);
        
        this.user = user;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });


    // Fetch profile data from API
    this.userService.fetchProfileData();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}

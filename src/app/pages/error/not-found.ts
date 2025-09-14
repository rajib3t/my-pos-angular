import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound implements OnInit {

  constructor(
    private titleService: TitleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Page Not Found');
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
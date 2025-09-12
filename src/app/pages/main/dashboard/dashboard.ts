import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  constructor(private titleService: TitleService) {}

  ngOnInit(): void {
    // You can optionally set a custom title here
    // this.titleService.setTitle('Dashboard Overview');
  }
}

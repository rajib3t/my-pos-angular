import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-store-edit',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './store-edit.html',
  styleUrl: './store-edit.css'
})
export class StoreEdit implements OnInit {

  
  constructor(
    private activatedRoute: ActivatedRoute
  ){

  }

  ngOnInit(): void {
    
  }
}

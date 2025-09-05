import { Component,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../services/ui.service';
import { Subscription } from 'rxjs';
import { Root } from 'postcss';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
private uiSubscription!: Subscription;

isMobileMenuOpen = false;

  constructor(private uiService: UiService) { }

  ngOnInit() {
   
       
        this.uiSubscription = this.uiService.isMobileMenuOpen.subscribe(isOpen => {
          this.isMobileMenuOpen = isOpen || false;
        });
  }

  ngOnDestroy() {
    this.uiSubscription.unsubscribe();
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}

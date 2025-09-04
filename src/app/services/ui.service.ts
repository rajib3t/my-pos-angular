import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UiService {
  

  constructor() { }

  isMobileMenuOpen =  new BehaviorSubject<boolean | null>(false);
  isUserMenuOpen = false;
  setOpenMobileMenu(isOpen: boolean) : boolean {
    // Logic to open/close mobile menu
    if (isOpen) {
      this.isMobileMenuOpen.next(true);
      return true;
    } else {
      this.isMobileMenuOpen.next(false);
      return false;
    }
  }

  getOpenMobileMenu() : boolean {
    // Logic to get the current state of mobile menu
    return this.isMobileMenuOpen.value || false;
  }
}

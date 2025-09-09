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


  getDomain() : string {
    return 'lead.mypos.test';
    return window.location.hostname;
  }

  getSubDomain() : string {
    const hostParts = this.getDomain().split('.');
    if (hostParts.length > 2) {
      return hostParts[0]; // Return the subdomain part
    }
    return ''; // No subdomain
  }

  isSubDomain() : boolean {
    const hostParts = this.getDomain().split('.');
    return hostParts.length > 2;
  }

  
}
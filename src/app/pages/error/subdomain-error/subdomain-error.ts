import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiService } from '../../../services/ui.service';
import { SubdomainValidationService } from '../../../services/subdomain-validation.service';
import { TitleService } from '../../../services/title.service';

@Component({
  selector: 'app-subdomain-error',
  imports: [CommonModule, RouterModule],
  templateUrl: './subdomain-error.html',
  styleUrl: './subdomain-error.css'
})
export class SubdomainError implements OnInit {
  subdomain: string = '';
  errorMessage: string = 'This subdomain account is not available';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private uiService: UiService,
    private subdomainValidationService: SubdomainValidationService,
    private titleService: TitleService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Subdomain Not Available');
    
    const subdomainInfo = this.subdomainValidationService.getSubdomainInfo();
    this.subdomain = subdomainInfo.subdomain;
    
    if (!subdomainInfo.isSubdomain) {
      // If not a subdomain, redirect to main login
      this.router.navigate(['/login']);
      return;
    }

    // Try to validate the subdomain to get a more specific error message
    this.validateSubdomain();
  }

  private validateSubdomain(): void {
    if (!this.subdomain) return;

    this.isLoading = true;
    this.subdomainValidationService.validateSubdomain(this.subdomain).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (!result.isValid && result.error) {
          this.errorMessage = result.error;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error validating subdomain:', error);
      }
    });
  }

  goToMainSite(): void {
    // Navigate to main domain (without subdomain)
    const currentDomain = this.uiService.getDomain();
    const domainParts = currentDomain.split('.');
    
    if (domainParts.length > 2) {
      // Remove subdomain and redirect to main domain
      const mainDomain = domainParts.slice(1).join('.');
      window.location.href = `${window.location.protocol}//${mainDomain}`;
    } else {
      // Already on main domain, just navigate to login
      this.router.navigate(['/login']);
    }
  }

  retryValidation(): void {
    this.subdomainValidationService.clearCache();
    this.validateSubdomain();
  }

  contactSupport(): void {
    // You can implement contact support functionality here
    // For now, we'll just show an alert
    alert('Please contact support for assistance with your subdomain account.');
  }
}

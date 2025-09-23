import { Injectable , effect, DestroyRef, inject} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { TenantService } from './tenant.service';
import { UiService } from './ui.service';
import { appState } from '../state/app.state';
import { Store } from './store.service';
@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly appName = 'MyPos';
    store : Partial<Store> | null = null
     private destroyRef = inject(DestroyRef);
  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tenantService: TenantService,
    private uiService: UiService
  
  ) {
    this.initializeTitleUpdates();
      const storeEffect = effect(() => {
      const storeData = appState.store;
      this.store = storeData
    });

     // Clean up the effect when the component is destroyed
    this.destroyRef.onDestroy(() => storeEffect.destroy());
  }

  /**
   * Set a custom title for the browser
   * @param title - The title to set
   */
  setTitle(title: string): void {
    if(this.uiService.isSubDomain()) {
        const tenantName = this.tenantService.getTenantSetting(this.store?._id as string).subscribe(tenant => {
        const fullTitle = title ? `${title} -  ${tenant.shopName}` : ` ${tenant.shopName}`;
        this.titleService.setTitle(fullTitle);
        });
    }else{
        const fullTitle = title ? `${title} - ${this.appName}` : this.appName;
        this.titleService.setTitle(fullTitle);
    }
  }

  /**
   * Get the current title
   */
  getTitle(): string {
    return this.titleService.getTitle();
  }

  /**
   * Initialize automatic title updates based on route changes
   */
  private initializeTitleUpdates(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map(route => route.snapshot.data['title'] || this.getDefaultTitleFromRoute(route.snapshot.routeConfig?.path || ''))
      )
      .subscribe(title => {
        this.setTitle(title);
      });
  }

  /**
   * Get default title based on route path if no custom title is provided
   */
  private getDefaultTitleFromRoute(path: string): string {
    const titleMap: { [key: string]: string } = {
      'login': 'Login',
      'dashboard': 'Dashboard',
      'profile': 'Profile', 
      'password': 'Change Password',
      'tenants': 'Tenants',
      'tenants/create': 'Create Tenant',
      'tenants/settings': 'Tenant Settings',
      'material-categories': 'Material Categories',
      'material-category-create': 'Create Material Category',
      '': 'Dashboard'
    };

    return titleMap[path] || 'MyPos';
  }
}
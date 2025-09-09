import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSidebar } from './tenant-sidebar';

describe('TenantSidebar', () => {
  let component: TenantSidebar;
  let fixture: ComponentFixture<TenantSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

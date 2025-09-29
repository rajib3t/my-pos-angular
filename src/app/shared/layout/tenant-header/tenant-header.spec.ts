import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantHeader } from './tenant-header';

describe('TenantHeader', () => {
  let component: TenantHeader;
  let fixture: ComponentFixture<TenantHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSetting } from './setting';

describe('TenantSetting', () => {
  let component: TenantSetting;
  let fixture: ComponentFixture<TenantSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantSetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

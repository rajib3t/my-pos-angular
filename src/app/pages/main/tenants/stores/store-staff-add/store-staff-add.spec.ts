import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStaffAdd } from './store-staff-add';

describe('StoreStaffAdd', () => {
  let component: StoreStaffAdd;
  let fixture: ComponentFixture<StoreStaffAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreStaffAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreStaffAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

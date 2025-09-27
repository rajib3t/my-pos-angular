import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStaff } from './store-staff';

describe('StoreStaff', () => {
  let component: StoreStaff;
  let fixture: ComponentFixture<StoreStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

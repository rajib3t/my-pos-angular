import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTenant } from './create';

describe('Create', () => {
  let component: CreateTenant;
  let fixture: ComponentFixture<CreateTenant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTenant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTenant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

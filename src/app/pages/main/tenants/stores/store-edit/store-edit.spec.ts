import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreEdit } from './store-edit';

describe('StoreEdit', () => {
  let component: StoreEdit;
  let fixture: ComponentFixture<StoreEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

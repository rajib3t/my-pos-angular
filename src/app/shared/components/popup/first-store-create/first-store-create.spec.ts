import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstStoreCreate } from './first-store-create';

describe('FirstStoreCreate', () => {
  let component: FirstStoreCreate;
  let fixture: ComponentFixture<FirstStoreCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstStoreCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstStoreCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCategoryEdit } from './material-category-edit';

describe('MaterialCategoryEdit', () => {
  let component: MaterialCategoryEdit;
  let fixture: ComponentFixture<MaterialCategoryEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCategoryEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialCategoryEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

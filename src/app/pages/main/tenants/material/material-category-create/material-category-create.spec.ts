import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCategoryCreate } from './material-category-create';

describe('MaterialCategoryCreate', () => {
  let component: MaterialCategoryCreate;
  let fixture: ComponentFixture<MaterialCategoryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCategoryCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialCategoryCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

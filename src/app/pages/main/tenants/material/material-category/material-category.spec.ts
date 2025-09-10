import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCategory } from './material-category';

describe('MaterialCategory', () => {
  let component: MaterialCategory;
  let fixture: ComponentFixture<MaterialCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

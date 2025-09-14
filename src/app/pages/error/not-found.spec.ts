import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotFound } from './not-found';
import { TitleService } from '../../services/title.service';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTitleService: jasmine.SpyObj<TitleService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const titleServiceSpy = jasmine.createSpyObj('TitleService', ['setTitle']);

    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TitleService, useValue: titleServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockTitleService = TestBed.inject(TitleService) as jasmine.SpyObj<TitleService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set title on init', () => {
    component.ngOnInit();
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Page Not Found');
  });

  it('should navigate to home when navigateHome is called', () => {
    component.navigateHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
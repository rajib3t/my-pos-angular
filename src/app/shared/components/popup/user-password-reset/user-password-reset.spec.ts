import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPasswordReset } from './user-password-reset';

describe('UserPasswordReset', () => {
  let component: UserPasswordReset;
  let fixture: ComponentFixture<UserPasswordReset>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPasswordReset]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPasswordReset);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

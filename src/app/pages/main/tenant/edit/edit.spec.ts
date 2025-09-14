import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EditTenant } from './edit';
import { TenantService, Tenant } from '../../../../services/tenant.service'
import { of, throwError } from 'rxjs';

describe('TenantEditComponent', () => {
  let component: EditTenant;
  let fixture: ComponentFixture<EditTenant>;
  let tenantServiceSpy: jasmine.SpyObj<TenantService>;

  beforeEach(async () => {
    tenantServiceSpy = jasmine.createSpyObj('TenantService', ['updateTenant']);
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EditTenant],
      providers: [
        { provide: TenantService, useValue: tenantServiceSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EditTenant);
    component = fixture.componentInstance;
    component.tenant = { id: '1', name: 'Tenant', subdomain: 'sub', databaseName: 'db', databaseUser: 'user' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form with tenant data', () => {
    expect(component.editForm.value.name).toBe('Tenant');
  });

  it('should call updateTenant on submit', () => {
    tenantServiceSpy.updateTenant.and.returnValue(of({ ...component.tenant } as Tenant));
    component.onSubmit();
    expect(tenantServiceSpy.updateTenant).toHaveBeenCalled();
  });

  it('should handle update error', () => {
    tenantServiceSpy.updateTenant.and.returnValue(throwError(() => new Error('fail')));
    component.onSubmit();
    expect(component.error).toBe('fail');
  });

  it('should emit cancel', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});

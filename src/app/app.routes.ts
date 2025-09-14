import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { MainLayout } from './shared/layout/main/main';
import { AuthGuard } from './auth.gourd';
import { LoginGuard } from './login.guard';
import { SubdomainGuard } from './subdomain.guard';
import { NoSubdomainGuard } from './no-subdomain.guard';
import { Dashboard } from './pages/main/dashboard/dashboard';
import { Profile } from './pages/main/profile/profile';
import { Password } from './pages/main/profile/password/password';
import { TenantList } from './pages/main/tenant/list/list';
import { CreateTenant } from './pages/main/tenant/create/create'
import { TenantSetting } from './pages/main/tenants/setting/setting';
import { MaterialCategory } from './pages/main/tenants/material/material-category/material-category'
import {MaterialCategoryCreate} from './pages/main/tenants/material/material-category-create/material-category-create'
import { EditTenant } from './pages/main/tenant/edit/edit';
import { NotFound } from './pages/error/not-found';
export const routes: Routes = [

    {
        path: '',
        component: MainLayout,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard,
                
                data: { title: 'Dashboard' }
            },
            {
                path: 'profile',
                component: Profile,
               
                data: { title: 'Profile' }
            },
            {
                path: 'password',
                component: Password,
               
                data: { title: 'Change Password' }
            },
            {
                path: 'tenants',
                component: TenantList,
                canActivate: [NoSubdomainGuard], // Only accessible on main domain
                data: { title: 'Tenants' }
            },
            {
                path: 'tenants/create',
                component: CreateTenant,
                canActivate: [NoSubdomainGuard], // Only accessible on main domain
                data: { title: 'Create Tenant' }
            },
            {
                path: 'tenants/:id/edit',
                component: EditTenant,
                canActivate: [NoSubdomainGuard], // Only accessible on main domain
                data: { title: 'Edit Tenant' }
            },
            // Subdomain protected routes
            {
                path: 'settings',
                component: TenantSetting,
                canActivate: [SubdomainGuard],
                data: { title: 'Tenant Settings' }
            },
            {
                path: 'material-categories',
                component: MaterialCategory,
                canActivate: [SubdomainGuard],
                data: { title: 'Material Categories' }
            },
            {
                path: 'material-category-create',
                component: MaterialCategoryCreate,
                canActivate: [SubdomainGuard],
                data: { title: 'Create Material Category' }
            },

        ]
    },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard],
        data: { title: 'Login' }
    },
    {
        path: '**',
        component: NotFound
    }
];

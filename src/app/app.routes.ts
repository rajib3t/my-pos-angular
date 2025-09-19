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
import { UserList as TenantUserList } from './pages/main/tenant/users/user-list/user-list';
import { UserCreate as TenantUserCreate } from './pages/main/tenant/users/user-create/user-create';
import { UserEdit as TenantUserEdit } from './pages/main/tenant/users/user-edit/user-edit';
import { UserList } from './pages/main/users/user-list/user-list';
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
                path:'users',
                component: UserList,
                data: { title: 'User List' }
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
                data: { title: 'Create Sub Account' }
            },
            {
                path: 'tenants/:id/edit',
                component: EditTenant,
                canActivate: [NoSubdomainGuard], // Only accessible on main domain
                data: { title: 'Edit Sub Account' }
            },
            {
                path:'tenants/:id/users',
                component:TenantUserList,
                canActivate:[NoSubdomainGuard],
                data:{title:'Sub Account User List'}
            },
            {
                path: 'tenants/:id/users/create',
                component: TenantUserCreate,
                canActivate: [NoSubdomainGuard],
                data: { title: 'Create Sub Account User' }
            },
            {
                path: 'tenants/:id/users/:userId/edit',
                component: TenantUserEdit,
                canActivate: [NoSubdomainGuard],
                data: { title: 'Edit Sub Account User' }
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

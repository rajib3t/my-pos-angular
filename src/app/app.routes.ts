import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { MainLayout } from './shared/layout/main/main';
import { AuthGuard } from './auth.gaurd';
import { LoginGuard } from './login.guard';
import { SubdomainGuard } from './subdomain.guard';
import { Dashboard } from './pages/main/dashboard/dashboard';
import { Profile } from './pages/main/profile/profile';
import { Password } from './pages/main/profile/password/password';
import { TenantList } from './pages/main/tenant/list/list';
import { CreateTenant } from './pages/main/tenant/create/create'
import { TenantSetting } from './pages/main/tenants/setting/setting';
import { MaterialCategory } from './pages/main/tenants/material/material-category/material-category'
import {MaterialCategoryCreate} from './pages/main/tenants/material/material-category-create/material-category-create'
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
                component: Dashboard
            },
            {
                path: 'profile',
                component: Profile
            },
            {
                path: 'password',
                component: Password
            },
            {
                path: 'tenants',
                component: TenantList
            },
            {
                path: 'tenants/create',
                component: CreateTenant
            },
            // Subdomain protected routes
            {
                path: 'tenants/settings',
                component: TenantSetting,
                canActivate: [SubdomainGuard]
            },
            {
                path: 'material-categories',
                component: MaterialCategory,
                canActivate: [SubdomainGuard]
            },
            {
                path: 'material-category-create',
                component: MaterialCategoryCreate,
                canActivate: [SubdomainGuard]
            },

        ]
    },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard]
    }
];

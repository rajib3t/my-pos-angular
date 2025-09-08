import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { MainLayout } from './shared/layout/main/main';
import { AuthGuard } from './auth.gaurd';
import { LoginGuard } from './login.guard';
import { Dashboard } from './pages/main/dashboard/dashboard';
import { Profile } from './pages/main/profile/profile';
import { Password } from './pages/main/profile/password/password';
import { TenantList } from './pages/main/tenant/list/list';
import { CreateTenant } from './pages/main/tenant/create/create'
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
            }
        ]
    },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard]
    }
];

import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { MainLayout } from './shared/layout/main/main';
import { AuthGuard } from './auth.gaurd';
import { LoginGuard } from './login.guard';
import { Dashboard } from './pages/main/dashboard/dashboard';
import { Profile } from './pages/main/profile/profile';
import { Password } from './pages/main/profile/password/password';
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
            }
        ]
    },
    {
        path: 'login',
        component: Login,
        canActivate: [LoginGuard]
    }
];

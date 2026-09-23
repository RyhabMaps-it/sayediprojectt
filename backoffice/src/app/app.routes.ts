import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
export const routes: Routes = [
  {
    path: 'connexion',
    loadComponent: () => import('./login/admin-login.component').then((m) => m.AdminLoginComponent)
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'produits',
        loadComponent: () => import('./products/admin-products.component').then((m) => m.AdminProductsComponent)
      },
      {
        path: 'couleurs',
        loadComponent: () => import('./colors/admin-colors.component').then((m) => m.AdminColorsComponent)
      },
      {
        path: 'catalogues',
        loadComponent: () =>
          import('./catalogues/admin-catalogues.component').then((m) => m.AdminCataloguesComponent)
      },
      {
        path: 'devis',
        loadComponent: () => import('./quotes/admin-quotes.component').then((m) => m.AdminQuotesComponent)
      },
      {
        path: 'rendez-vous',
        loadComponent: () =>
          import('./appointments/admin-appointments.component').then((m) => m.AdminAppointmentsComponent)
      },
      {
        path: 'collaborations',
        loadComponent: () =>
          import('./collaborations/admin-collaborations.component').then((m) => m.AdminCollaborationsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

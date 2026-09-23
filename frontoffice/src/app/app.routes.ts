import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'catalogues/:id',
    loadComponent: () =>
      import('./pages/catalogue-viewer/catalogue-viewer.component').then((m) => m.CatalogueViewerComponent)
  },
  {
    path: 'boutique',
    loadComponent: () => import('./pages/shop/shop.component').then((m) => m.ShopComponent)
  },
  {
    path: 'boutique/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent)
  },
  {
    path: 'panier',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent)
  },
  {
    path: 'commande',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'compte',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account.component').then((m) => m.AccountComponent)
  },
  {
    path: 'a-propos',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent)
  },
  {
    path: 'devis',
    loadComponent: () => import('./pages/devis/devis.component').then((m) => m.DevisComponent)
  },
  {
    path: 'rendez-vous',
    loadComponent: () => import('./pages/rendez-vous/rendez-vous.component').then((m) => m.RendezVousComponent)
  },
  {
    path: 'collaboration',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/collaboration/collaboration.component').then((m) => m.CollaborationComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  }
];

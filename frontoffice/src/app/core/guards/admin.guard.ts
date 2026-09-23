import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.hasRole('ROLE_ADMIN')) {
    return true;
  }

  if (authService.isLoggedIn()) {
    authService.logout();
  }
  router.navigate(['/connexion'], { queryParams: { returnUrl: state.url } });
  return false;
};

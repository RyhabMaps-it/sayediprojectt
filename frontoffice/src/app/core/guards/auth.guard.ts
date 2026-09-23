import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginModalService } from '../services/login-modal.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  inject(LoginModalService).open(state.url);
  // Stay on the current page; on a direct visit (no page yet) fall back to home.
  return router.navigated ? false : router.createUrlTree(['/']);
};

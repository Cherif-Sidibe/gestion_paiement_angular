import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '@core/store/session.store';

export const clientGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.role() === 'CLIENT') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

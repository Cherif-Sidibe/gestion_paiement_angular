import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '@core/store/session.store';

export const agentGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.role() === 'AGENT') {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

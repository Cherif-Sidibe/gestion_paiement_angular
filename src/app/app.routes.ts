import { Routes } from '@angular/router';
import { agentGuard } from '@core/guards/agent.guard';
import { clientGuard } from '@core/guards/client.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/entry/entry.component').then((c) => c.EntryComponent),
  },

  // Espace Agent (lazy)
  {
    path: 'admin',
    canActivate: [agentGuard],
    loadChildren: () =>
      import('./features/agent/routes/agent.routes').then(
        (c) => c.AGENT_ROUTES,
      ),
  },

  // Espace Client (lazy)
  {
    path: '',
    canActivate: [clientGuard],
    loadChildren: () =>
      import('./features/client/routes/client.routes').then(
        (c) => c.CLIENT_ROUTES,
      ),
  },

  { path: '**', redirectTo: 'login' },
];

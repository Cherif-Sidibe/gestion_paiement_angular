import { Routes } from '@angular/router';
import { AgentLayoutComponent } from '@layouts/agent/agent-layout.component';

export const AGENT_ROUTES: Routes = [
  {
    path: '',
    component: AgentLayoutComponent,
    children: [
      {
        path: 'wallets',
        loadComponent: () =>
          import('../wallets/wallets.component').then((c) => c.WalletsComponent),
      },
      {
        path: '',
        redirectTo: 'wallets',
        pathMatch: 'full',
      },
    ],
  },
];

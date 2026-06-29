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
          import('../wallets-list/wallets-list.component').then(
            (c) => c.WalletsListComponent,
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('../wallet-search/wallet-search.component').then(
            (c) => c.WalletSearchComponent,
          ),
      },
      {
        path: 'deposit',
        loadComponent: () =>
          import('../agent-deposit/agent-deposit.component').then(
            (c) => c.AgentDepositComponent,
          ),
      },
      {
        path: 'withdraw',
        loadComponent: () =>
          import('../agent-withdraw/agent-withdraw.component').then(
            (c) => c.AgentWithdrawComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'wallets',
        pathMatch: 'full',
      },
    ],
  },
];

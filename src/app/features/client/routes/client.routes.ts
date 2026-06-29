import { Routes } from '@angular/router';
import { ClientLayoutComponent } from '@layouts/client/client-layout.component';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard/dashboard.component').then(
            (c) => c.DashboardComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../transactions/transactions.component').then(
            (c) => c.TransactionsComponent,
          ),
      },
      {
        path: 'transfer',
        loadComponent: () =>
          import('../transfer/transfer.component').then(
            (c) => c.TransferComponent,
          ),
      },
      {
        path: 'bills',
        loadComponent: () =>
          import('../bills/bills.component').then((c) => c.BillsComponent),
        children: [
          {
            path: 'current',
            loadComponent: () =>
              import('../bills/bills-current/bills-current.component').then(
                (c) => c.BillsCurrentComponent,
              ),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('../bills/bills-history/bills-history.component').then(
                (c) => c.BillsHistoryComponent,
              ),
          },
          {
            path: '',
            redirectTo: 'current',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

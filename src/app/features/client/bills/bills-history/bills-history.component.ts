import { Component } from '@angular/core';

@Component({
  selector: 'app-bills-history',
  standalone: true,
  template: `
    <h2 class="h5 mb-2">Historique des factures</h2>
    <p class="text-muted">Factures réglées — à venir.</p>
  `,
})
export class BillsHistoryComponent {}

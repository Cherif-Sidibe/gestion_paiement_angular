import { Component } from '@angular/core';

@Component({
  selector: 'app-bills-current',
  standalone: true,
  template: `
    <h2 class="h5 mb-2">Factures en cours</h2>
    <p class="text-muted">Factures à payer — à venir.</p>
  `,
})
export class BillsCurrentComponent {}

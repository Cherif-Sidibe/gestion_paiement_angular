import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SessionStore } from '@core/store/session.store';
import { Transaction } from '@core/models/transaction.model';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-bills-history',
  standalone: true,
  imports: [XofPipe],
  template: `
    <h2 class="h5 mb-3">Historique des paiements</h2>

    <div class="card shadow-sm">
      <div class="card-body">
        @if (loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement…</span>
            </div>
          </div>
        } @else if (payments().length === 0) {
          <p class="text-muted text-center mb-0 py-4">
            Aucun paiement de facture enregistré.
          </p>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th class="text-end">Montant</th>
                  <th class="text-end">Frais</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of payments(); track tx.id) {
                  <tr>
                    <td><span class="badge text-bg-danger">Paiement</span></td>
                    <td class="text-end">{{ tx.amount | xof }}</td>
                    <td class="text-end">{{ tx.fees | xof }}</td>
                    <td>{{ tx.createdAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="text-muted small text-center mt-3 mb-0">
            {{ payments().length }} paiement(s)
          </p>
        }
      </div>
    </div>
  `,
})
export class BillsHistoryComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);

  readonly loading = signal(false);
  private readonly transactions = signal<Transaction[]>([]);

  readonly payments = computed(() =>
    this.transactions().filter((tx) => tx.type === 'PAIEMENT'),
  );

  ngOnInit(): void {
    const phone = this.session.currentPhone();
    if (!phone) {
      return;
    }
    this.loading.set(true);
    this.walletApi.getTransactions(phone).subscribe({
      next: (list) => {
        this.transactions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

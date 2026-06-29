import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionStore } from '@core/store/session.store';
import {
  Transaction,
  TransactionType,
} from '@core/models/transaction.model';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';
import { XofPipe } from '@shared/pipes/xof.pipe';

type TypeFilter = 'TOUS' | 'DEPOT' | 'RETRAIT' | 'TRANSFERT' | 'PAIEMENT';

const BADGE: Record<TransactionType, { label: string; color: string }> = {
  DEPOT: { label: 'Dépôt', color: 'success' },
  RETRAIT: { label: 'Retrait', color: 'warning' },
  TRANSFERT_RECU: { label: 'Transfert reçu', color: 'info' },
  TRANSFERT_ENVOYE: { label: 'Transfert envoyé', color: 'primary' },
  PAIEMENT: { label: 'Paiement', color: 'danger' },
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, XofPipe],
  template: `
    <h1 class="h3 mb-3">Transactions</h1>

    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label" for="typeFilter">Type</label>
            <select
              id="typeFilter"
              class="form-select"
              [ngModel]="typeFilter()"
              (ngModelChange)="typeFilter.set($event)"
            >
              <option value="TOUS">Tous</option>
              <option value="DEPOT">Dépôt</option>
              <option value="RETRAIT">Retrait</option>
              <option value="TRANSFERT">Transfert</option>
              <option value="PAIEMENT">Paiement</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="dateFrom">Du</label>
            <input
              id="dateFrom"
              type="date"
              class="form-control"
              [ngModel]="dateFrom()"
              (ngModelChange)="dateFrom.set($event)"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label" for="dateTo">Au</label>
            <input
              id="dateTo"
              type="date"
              class="form-control"
              [ngModel]="dateTo()"
              (ngModelChange)="dateTo.set($event)"
            />
          </div>
          <div class="col-md-2">
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              (click)="resetFilters()"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        @if (loading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement…</span>
            </div>
          </div>
        } @else if (filtered().length === 0) {
          <p class="text-muted text-center mb-0 py-4">
            Aucune transaction ne correspond aux filtres.
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
                @for (tx of filtered(); track tx.id) {
                  <tr>
                    <td>
                      <span class="badge text-bg-{{ badgeColor(tx.type) }}">
                        {{ badgeLabel(tx.type) }}
                      </span>
                    </td>
                    <td class="text-end">{{ tx.amount | xof }}</td>
                    <td class="text-end">{{ tx.fees | xof }}</td>
                    <td>{{ tx.createdAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="text-muted small text-center mt-3 mb-0">
            {{ filtered().length }} transaction(s) affichée(s)
          </p>
        }
      </div>
    </div>
  `,
})
export class TransactionsComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);

  readonly loading = signal(false);
  readonly typeFilter = signal<TypeFilter>('TOUS');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  private readonly transactions = signal<Transaction[]>([]);

  readonly filtered = computed(() => {
    const type = this.typeFilter();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.transactions().filter((tx) => {
      if (type !== 'TOUS') {
        if (type === 'TRANSFERT') {
          if (!tx.type.startsWith('TRANSFERT')) {
            return false;
          }
        } else if (tx.type !== type) {
          return false;
        }
      }
      const iso = this.toIso(tx.createdAt);
      if (from && iso < from) {
        return false;
      }
      if (to && iso > to) {
        return false;
      }
      return true;
    });
  });

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

  badgeColor(type: TransactionType): string {
    return BADGE[type].color;
  }

  badgeLabel(type: TransactionType): string {
    return BADGE[type].label;
  }

  resetFilters(): void {
    this.typeFilter.set('TOUS');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  private toIso(createdAt: string): string {
    const [d, m, y] = createdAt.slice(0, 10).split('/');
    return `${y}-${m}-${d}`;
  }
}

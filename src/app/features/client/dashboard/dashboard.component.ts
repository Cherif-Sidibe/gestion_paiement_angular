import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionStore } from '@core/store/session.store';
import { BalanceStore } from '@core/store/balance.store';
import {
  Transaction,
  TransactionType,
} from '@core/models/transaction.model';
import {
  WALLET_API_SERVICE_TOKEN,
} from '@core/services/interfaces/wallet-api.interface';
import { XofPipe } from '@shared/pipes/xof.pipe';

interface TypeBreakdown {
  type: TransactionType;
  label: string;
  amount: number;
  percent: number;
  colorClass: string;
}

const INCOME_TYPES: TransactionType[] = ['DEPOT', 'TRANSFERT_RECU'];

const TYPE_META: Record<TransactionType, { label: string; color: string }> = {
  DEPOT: { label: 'Dépôts', color: 'success' },
  TRANSFERT_RECU: { label: 'Transferts reçus', color: 'info' },
  RETRAIT: { label: 'Retraits', color: 'warning' },
  TRANSFERT_ENVOYE: { label: 'Transferts envoyés', color: 'primary' },
  PAIEMENT: { label: 'Paiements', color: 'danger' },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, XofPipe],
  template: `
    <h1 class="h3 mb-3">Tableau de bord</h1>

    <div class="row g-3 mb-4">
      <div class="col-lg-4">
        <div class="card shadow-sm h-100 bg-primary text-white">
          <div class="card-body">
            <h2 class="h6 text-uppercase opacity-75 mb-2">Solde disponible</h2>
            <p class="display-6 fw-bold mb-0">{{ balance() | xof }}</p>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-6">
        <div class="card shadow-sm h-100 border-success">
          <div class="card-body">
            <h2 class="h6 text-success mb-2">
              <i class="bi bi-arrow-down-circle"></i> Revenus
            </h2>
            <p class="h4 fw-bold mb-0">{{ totalIncome() | xof }}</p>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-6">
        <div class="card shadow-sm h-100 border-danger">
          <div class="card-body">
            <h2 class="h6 text-danger mb-2">
              <i class="bi bi-arrow-up-circle"></i> Dépenses
            </h2>
            <p class="h4 fw-bold mb-0">{{ totalExpense() | xof }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h2 class="h5 mb-3">Revenus vs Dépenses</h2>
            @if (loading()) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Chargement…</span>
                </div>
              </div>
            } @else if (totalIncome() === 0 && totalExpense() === 0) {
              <p class="text-muted mb-0">Aucune transaction à afficher.</p>
            } @else {
              <div class="mb-3">
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-success fw-semibold">Revenus</span>
                  <span>{{ totalIncome() | xof }}</span>
                </div>
                <div class="progress" style="height: 1.5rem">
                  <div
                    class="progress-bar bg-success"
                    role="progressbar"
                    [style.width.%]="incomePercent()"
                  ></div>
                </div>
              </div>
              <div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-danger fw-semibold">Dépenses</span>
                  <span>{{ totalExpense() | xof }}</span>
                </div>
                <div class="progress" style="height: 1.5rem">
                  <div
                    class="progress-bar bg-danger"
                    role="progressbar"
                    [style.width.%]="expensePercent()"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h2 class="h5 mb-3">Répartition par type</h2>
            @if (loading()) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Chargement…</span>
                </div>
              </div>
            } @else if (breakdown().length === 0) {
              <p class="text-muted mb-0">Aucune transaction à afficher.</p>
            } @else {
              @for (item of breakdown(); track item.type) {
                <div class="mb-2">
                  <div class="d-flex justify-content-between small mb-1">
                    <span>{{ item.label }}</span>
                    <span class="text-muted">{{ item.amount | xof }}</span>
                  </div>
                  <div class="progress" style="height: 0.75rem">
                    <div
                      class="progress-bar bg-{{ item.colorClass }}"
                      role="progressbar"
                      [style.width.%]="item.percent"
                    ></div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>

    <h2 class="h5 mb-3">Accès rapides</h2>
    <div class="row g-3">
      <div class="col-md-4">
        <a
          routerLink="/transfer"
          class="card shadow-sm h-100 text-decoration-none text-dark"
        >
          <div class="card-body text-center">
            <i class="bi bi-arrow-left-right fs-1 text-primary"></i>
            <p class="mt-2 mb-0 fw-semibold">Transfert</p>
          </div>
        </a>
      </div>
      <div class="col-md-4">
        <a
          routerLink="/bills"
          class="card shadow-sm h-100 text-decoration-none text-dark"
        >
          <div class="card-body text-center">
            <i class="bi bi-receipt fs-1 text-primary"></i>
            <p class="mt-2 mb-0 fw-semibold">Factures</p>
          </div>
        </a>
      </div>
      <div class="col-md-4">
        <a
          routerLink="/transactions"
          class="card shadow-sm h-100 text-decoration-none text-dark"
        >
          <div class="card-body text-center">
            <i class="bi bi-list-ul fs-1 text-primary"></i>
            <p class="mt-2 mb-0 fw-semibold">Transactions</p>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly balanceStore = inject(BalanceStore);
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);

  readonly balance = this.balanceStore.balance;
  readonly loading = signal(false);
  private readonly transactions = signal<Transaction[]>([]);

  readonly totalIncome = computed(() => this.sumByTypes(INCOME_TYPES));
  readonly totalExpense = computed(() =>
    this.sumByTypes(['RETRAIT', 'TRANSFERT_ENVOYE', 'PAIEMENT']),
  );

  readonly incomePercent = computed(() => this.share(this.totalIncome()));
  readonly expensePercent = computed(() => this.share(this.totalExpense()));

  readonly breakdown = computed<TypeBreakdown[]>(() => {
    const totals = new Map<TransactionType, number>();
    for (const tx of this.transactions()) {
      totals.set(tx.type, (totals.get(tx.type) ?? 0) + tx.amount);
    }
    const max = Math.max(0, ...totals.values());
    return (Object.keys(TYPE_META) as TransactionType[])
      .map((type) => {
        const amount = totals.get(type) ?? 0;
        return {
          type,
          label: TYPE_META[type].label,
          amount,
          percent: max > 0 ? (amount / max) * 100 : 0,
          colorClass: TYPE_META[type].color,
        };
      })
      .filter((item) => item.amount > 0);
  });

  ngOnInit(): void {
    const phone = this.session.currentPhone();
    if (!phone) {
      return;
    }
    this.balanceStore.refresh(phone);
    this.loading.set(true);
    this.walletApi.getTransactions(phone).subscribe({
      next: (list) => {
        this.transactions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private sumByTypes(types: TransactionType[]): number {
    return this.transactions()
      .filter((tx) => types.includes(tx.type))
      .reduce((acc, tx) => acc + tx.amount, 0);
  }

  private share(value: number): number {
    const total = this.totalIncome() + this.totalExpense();
    return total > 0 ? (value / total) * 100 : 0;
  }
}

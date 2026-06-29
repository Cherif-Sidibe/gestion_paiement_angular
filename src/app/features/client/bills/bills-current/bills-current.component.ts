import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionStore } from '@core/store/session.store';
import { BalanceStore } from '@core/store/balance.store';
import { Facture } from '@core/models/facture.model';
import { WALLET_API_SERVICE_TOKEN } from '@core/services/interfaces/wallet-api.interface';
import { BILLING_API_SERVICE_TOKEN } from '@core/services/interfaces/billing-api.interface';
import { ToastService } from '@core/services/toast.service';
import { XofPipe } from '@shared/pipes/xof.pipe';

type ServiceFilter = 'TOUS' | 'WOYAFAL' | 'ISM';

@Component({
  selector: 'app-bills-current',
  standalone: true,
  imports: [FormsModule, XofPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h2 class="h5 mb-0">Factures en cours</h2>
      <div class="d-flex align-items-center gap-2">
        <label class="form-label mb-0 text-muted small">Fournisseur</label>
        <select
          class="form-select form-select-sm"
          style="width: auto"
          [ngModel]="serviceFilter()"
          (ngModelChange)="onServiceChange($event)"
        >
          <option value="TOUS">Tous</option>
          <option value="WOYAFAL">WOYAFAL</option>
          <option value="ISM">ISM</option>
        </select>
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
        } @else if (factures().length === 0) {
          <p class="text-muted text-center mb-0 py-4">
            Aucune facture impayée.
          </p>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style="width: 3rem"></th>
                  <th>Référence</th>
                  <th>Service</th>
                  <th>Mois</th>
                  <th class="text-end">Montant</th>
                </tr>
              </thead>
              <tbody>
                @for (facture of factures(); track facture.reference) {
                  <tr>
                    <td>
                      <input
                        class="form-check-input"
                        type="checkbox"
                        [checked]="isSelected(facture.reference)"
                        (change)="toggle(facture.reference)"
                      />
                    </td>
                    <td>{{ facture.reference }}</td>
                    <td>
                      <span class="badge text-bg-secondary">{{ facture.service }}</span>
                    </td>
                    <td>{{ facture.mois }}</td>
                    <td class="text-end">{{ facture.montant | xof }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <span class="text-muted">
              {{ selectedCount() }} sélectionnée(s) —
              total <strong>{{ selectedTotal() | xof }}</strong>
            </span>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="paying() || selectedCount() === 0"
              (click)="paySelection()"
            >
              @if (paying()) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Payer la sélection
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class BillsCurrentComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly balanceStore = inject(BalanceStore);
  private readonly walletApi = inject(WALLET_API_SERVICE_TOKEN);
  private readonly billingApi = inject(BILLING_API_SERVICE_TOKEN);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly paying = signal(false);
  readonly serviceFilter = signal<ServiceFilter>('TOUS');
  readonly factures = signal<Facture[]>([]);
  private readonly selected = signal<Set<string>>(new Set());
  private walletCode: string | null = null;

  readonly selectedCount = computed(() => this.selected().size);
  readonly selectedTotal = computed(() => {
    const refs = this.selected();
    return this.factures()
      .filter((f) => refs.has(f.reference))
      .reduce((acc, f) => acc + f.montant, 0);
  });

  ngOnInit(): void {
    const phone = this.session.currentPhone();
    if (!phone) {
      return;
    }
    this.loading.set(true);
    this.walletApi.getWalletByPhone(phone).subscribe({
      next: (wallet) => {
        this.walletCode = wallet.code;
        this.loadFactures();
      },
      error: () => this.loading.set(false),
    });
  }

  onServiceChange(value: ServiceFilter): void {
    this.serviceFilter.set(value);
    this.loadFactures();
  }

  isSelected(reference: string): boolean {
    return this.selected().has(reference);
  }

  toggle(reference: string): void {
    const next = new Set(this.selected());
    if (next.has(reference)) {
      next.delete(reference);
    } else {
      next.add(reference);
    }
    this.selected.set(next);
  }

  paySelection(): void {
    const phone = this.session.currentPhone();
    if (!phone) {
      return;
    }
    const refs = this.selected();
    const chosen = this.factures().filter((f) => refs.has(f.reference));
    if (chosen.length === 0) {
      return;
    }

    const groups = new Map<string, string[]>();
    for (const facture of chosen) {
      const list = groups.get(facture.service) ?? [];
      list.push(facture.reference);
      groups.set(facture.service, list);
    }

    const calls = [...groups.entries()].map(([serviceName, factureReferences]) =>
      this.billingApi.payFactures({
        phoneNumber: phone,
        serviceName,
        factureReferences,
      }),
    );

    this.paying.set(true);
    forkJoin(calls).subscribe({
      next: () => {
        this.paying.set(false);
        this.toast.success('Paiement effectué avec succès.');
        this.selected.set(new Set());
        this.balanceStore.refresh(phone);
        this.loadFactures();
      },
      error: () => this.paying.set(false),
    });
  }

  private loadFactures(): void {
    if (!this.walletCode) {
      return;
    }
    const unite =
      this.serviceFilter() === 'TOUS' ? undefined : this.serviceFilter();
    this.loading.set(true);
    this.selected.set(new Set());
    this.billingApi.getCurrentFactures(this.walletCode, unite).subscribe({
      next: (list) => {
        this.factures.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

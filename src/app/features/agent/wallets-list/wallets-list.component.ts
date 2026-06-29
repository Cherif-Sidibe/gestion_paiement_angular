import { Component, Inject, OnInit } from '@angular/core';
import { PageResponse } from '@core/models/rest-response.model';
import { Wallet } from '@core/models/wallet.model';
import {
  WALLET_API_SERVICE_TOKEN,
  WalletApiServiceInterface,
} from '@core/services/interfaces/wallet-api.interface';
import { PhonePipe } from '@shared/pipes/phone.pipe';
import { XofPipe } from '@shared/pipes/xof.pipe';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { WalletCreateComponent } from '@features/agent/wallet-create/wallet-create.component';

@Component({
  selector: 'app-wallets-list',
  standalone: true,
  imports: [PhonePipe, XofPipe, PaginationComponent, WalletCreateComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0">Wallets</h1>
      <button class="btn btn-primary" type="button" (click)="toggleCreate()">
        <i class="bi" [class.bi-plus-lg]="!showCreate" [class.bi-x-lg]="showCreate"></i>
        {{ showCreate ? 'Fermer' : 'Nouveau wallet' }}
      </button>
    </div>

    @if (showCreate) {
      <div class="mb-4">
        <app-wallet-create (created)="onCreated()" />
      </div>
    }

    <div class="card shadow-sm">
      <div class="card-body">
        @if (loading) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement…</span>
            </div>
          </div>
        } @else if (!page || page.data.length === 0) {
          <p class="text-muted text-center mb-0 py-4">Aucun wallet trouvé.</p>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th class="text-end">Solde</th>
                  <th>Devise</th>
                </tr>
              </thead>
              <tbody>
                @for (wallet of page.data; track wallet.id) {
                  <tr>
                    <td>{{ wallet.code }}</td>
                    <td>{{ wallet.phoneNumber | phone }}</td>
                    <td>{{ wallet.email }}</td>
                    <td class="text-end">{{ wallet.balance | xof }}</td>
                    <td>{{ wallet.currency }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (page.totalPages > 1) {
            <app-pagination
              [pages]="pages"
              [currentPage]="pageIndex + 1"
              (pageChange)="onPageChange($event)"
            />
          }

          <p class="text-muted small text-center mt-3 mb-0">
            {{ page.totalElements }} wallet(s) au total
          </p>
        }
      </div>
    </div>
  `,
})
export class WalletsListComponent implements OnInit {
  page?: PageResponse<Wallet>;
  pageIndex = 0;
  readonly size = 10;
  loading = false;
  showCreate = false;

  constructor(
    @Inject(WALLET_API_SERVICE_TOKEN)
    private walletApi: WalletApiServiceInterface,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get pages(): number[] {
    const total = this.page?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  load(): void {
    this.loading = true;
    this.walletApi.listWallets(this.pageIndex, this.size).subscribe({
      next: (page) => {
        this.page = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page - 1;
    this.load();
  }

  toggleCreate(): void {
    this.showCreate = !this.showCreate;
  }

  onCreated(): void {
    this.showCreate = false;
    this.pageIndex = 0;
    this.load();
  }
}

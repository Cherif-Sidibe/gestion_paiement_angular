import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '@core/store/session.store';
import { BalanceStore } from '@core/store/balance.store';
import { PhonePipe } from '@shared/pipes/phone.pipe';
import { XofPipe } from '@shared/pipes/xof.pipe';

@Component({
  selector: 'app-header-client',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PhonePipe, XofPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly balanceStore = inject(BalanceStore);
  private readonly router = inject(Router);

  readonly currentPhone = this.session.currentPhone;
  readonly balance = this.balanceStore.balance;

  ngOnInit(): void {
    const phone = this.currentPhone();
    if (phone) {
      this.balanceStore.refresh(phone);
    }
  }

  logout(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }
}

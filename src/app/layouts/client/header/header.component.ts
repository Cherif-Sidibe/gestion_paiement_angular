import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '@core/store/session.store';
import { PhonePipe } from '@shared/pipes/phone.pipe';

@Component({
  selector: 'app-header-client',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PhonePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly currentPhone = this.session.currentPhone;

  logout(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }
}

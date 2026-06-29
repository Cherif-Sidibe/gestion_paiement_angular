import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '@core/store/session.store';

@Component({
  selector: 'app-header-agent',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  logout(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }
}

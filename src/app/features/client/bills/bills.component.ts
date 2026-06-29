import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <h1 class="h3 mb-3">Factures</h1>
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" routerLinkActive="active" routerLink="/bills/current">
          En cours
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" routerLinkActive="active" routerLink="/bills/history">
          Historique
        </a>
      </li>
    </ul>
    <router-outlet />
  `,
})
export class BillsComponent {}

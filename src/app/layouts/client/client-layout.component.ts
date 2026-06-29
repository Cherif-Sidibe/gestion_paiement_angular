import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/client/header/header.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header-client />
    <main class="container py-4">
      <router-outlet />
    </main>
  `,
})
export class ClientLayoutComponent {}

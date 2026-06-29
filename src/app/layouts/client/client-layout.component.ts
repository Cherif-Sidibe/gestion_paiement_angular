import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/client/header/header.component';
import { ToastContainerComponent } from '@shared/components/toast/toast-container.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastContainerComponent],
  template: `
    <app-header-client />
    <main class="container py-4">
      <router-outlet />
    </main>
    <app-toast-container />
  `,
})
export class ClientLayoutComponent {}

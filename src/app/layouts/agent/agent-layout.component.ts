import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/agent/header/header.component';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header-agent />
    <main class="container py-4">
      <router-outlet />
    </main>
  `,
})
export class AgentLayoutComponent {}

import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '@core/store/session.store';

@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.css',
})
export class EntryComponent {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  phoneNumber = '';
  errorMessage = '';

  enterAsAgent(): void {
    this.session.setAgent();
    this.router.navigate(['/admin/wallets']);
  }

  enterAsClient(form: NgForm): void {
    if (form.invalid || !this.phoneNumber.trim()) {
      this.errorMessage = 'Veuillez saisir un numéro de téléphone.';
      return;
    }
    this.session.setClient(this.phoneNumber.trim());
    this.router.navigate(['/dashboard']);
  }
}

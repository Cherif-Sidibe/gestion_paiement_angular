import { Injectable, computed, signal } from '@angular/core';

export type SessionRole = 'AGENT' | 'CLIENT' | null;

@Injectable({
  providedIn: 'root',
})
export class SessionStore {
  private readonly ROLE_KEY = 'bw-role';
  private readonly PHONE_KEY = 'bw-phone';

  private readonly _role = signal<SessionRole>(this.readRole());
  private readonly _currentPhone = signal<string | null>(
    localStorage.getItem(this.PHONE_KEY),
  );

  readonly role = this._role.asReadonly();
  readonly currentPhone = this._currentPhone.asReadonly();
  readonly isAuthenticated = computed(() => this._role() !== null);

  setAgent(): void {
    this._role.set('AGENT');
    this._currentPhone.set(null);
    localStorage.setItem(this.ROLE_KEY, 'AGENT');
    localStorage.removeItem(this.PHONE_KEY);
  }

  setClient(phone: string): void {
    this._role.set('CLIENT');
    this._currentPhone.set(phone);
    localStorage.setItem(this.ROLE_KEY, 'CLIENT');
    localStorage.setItem(this.PHONE_KEY, phone);
  }

  clear(): void {
    this._role.set(null);
    this._currentPhone.set(null);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.PHONE_KEY);
  }

  private readRole(): SessionRole {
    const raw = localStorage.getItem(this.ROLE_KEY);
    return raw === 'AGENT' || raw === 'CLIENT' ? raw : null;
  }
}

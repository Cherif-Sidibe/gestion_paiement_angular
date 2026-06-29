import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private counter = 0;

  show(type: ToastType, message: string): void {
    const toast: Toast = { id: ++this.counter, type, message };
    this._toasts.update((list) => [...list, toast]);
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  remove(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}

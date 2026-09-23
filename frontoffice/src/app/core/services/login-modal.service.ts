import { Injectable, signal } from '@angular/core';

export type AuthModalMode = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class LoginModalService {
  readonly isOpen = signal(false);
  readonly mode = signal<AuthModalMode>('login');
  readonly returnUrl = signal<string | null>(null);

  open(returnUrl: string | null = null, mode: AuthModalMode = 'login'): void {
    this.returnUrl.set(returnUrl);
    this.mode.set(mode);
    this.isOpen.set(true);
  }

  openRegister(returnUrl: string | null = null): void {
    this.open(returnUrl, 'register');
  }

  switchTo(mode: AuthModalMode): void {
    this.mode.set(mode);
  }

  close(): void {
    this.isOpen.set(false);
    this.returnUrl.set(null);
  }
}

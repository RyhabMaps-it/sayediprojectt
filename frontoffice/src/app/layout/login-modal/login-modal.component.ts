import { CommonModule } from '@angular/common';
import { Component, HostListener, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthResponse } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { AuthModalMode, LoginModalService } from '../../core/services/login-modal.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss'
})
export class LoginModalComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    public modal: LoginModalService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private i18n: I18nService
  ) {
    effect(() => {
      document.body.style.overflow = this.modal.isOpen() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.modal.isOpen()) return;
    this.modal.close();
    this.reset();
  }

  switchTo(mode: AuthModalMode): void {
    this.error.set(null);
    this.showPassword.set(false);
    this.modal.switchTo(mode);
  }

  submit(): void {
    const request$: Observable<AuthResponse> =
      this.modal.mode() === 'login'
        ? this.authService.login({ email: this.email, password: this.password })
        : this.authService.register({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            password: this.password
          });
    const fallbackError =
      this.i18n.t(this.modal.mode() === 'login' ? 'auth.loginError' : 'auth.registerError');

    this.loading.set(true);
    this.error.set(null);
    request$.subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.modal.returnUrl();
        this.modal.close();
        this.reset();
        this.cartService.refresh().subscribe();
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? fallbackError);
      }
    });
  }

  private reset(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.password = '';
    this.error.set(null);
    this.showPassword.set(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: '../auth-page.scss'
})
export class RegisterComponent {
  visualImage = resolveImageUrl('/images/products/claustra-skaya-2.jpg');
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  private i18n = inject(I18nService);

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.authService
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        password: this.password
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? this.i18n.t('auth.registerError'));
        }
      });
  }
}

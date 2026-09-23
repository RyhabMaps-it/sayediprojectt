import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  address = {
    fullName: '',
    line1: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  };

  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  orderPlaced = signal<string | null>(null);

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.address.country = this.i18n.t('checkout.defaultCountry');
    const user = this.authService.currentUser();
    if (user) {
      this.address.fullName = `${user.firstName} ${user.lastName}`;
    }
    this.cartService.refresh().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  imageUrl(path: string | null): string {
    return resolveImageUrl(path);
  }

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.orderService.checkout(this.address).subscribe({
      next: (order) => {
        this.submitting.set(false);
        this.orderPlaced.set(order.orderNumber);
        this.cartService.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message ?? this.i18n.t('checkout.error'));
      }
    });
  }
}

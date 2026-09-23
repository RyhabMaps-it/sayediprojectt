import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  loading = signal(true);
  cart = computed(() => this.cartService.cart());

  constructor(public cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.refresh().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  imageUrl(path: string | null): string {
    return resolveImageUrl(path);
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateItem(itemId, quantity).subscribe();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe();
  }
}

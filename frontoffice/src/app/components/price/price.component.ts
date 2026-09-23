import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-price',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (priceOnRequest || price === null) {
      <span class="on-request">{{ 'common.onRequest' | t }}</span>
    } @else {
      <span class="amount">{{ price | number: '1.0-2' }} {{ 'common.currency' | t }}</span>
    }
  `,
  styles: [
    `
      .amount {
        font-weight: 700;
        color: var(--color-maroon);
      }
      .on-request {
        font-weight: 600;
        color: var(--color-gold);
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
      }
    `
  ]
})
export class PriceComponent {
  @Input() price: number | null = null;
  @Input() priceOnRequest = false;
}

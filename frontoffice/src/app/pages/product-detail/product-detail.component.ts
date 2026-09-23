import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Color } from '../../core/models/color.model';
import { Product } from '../../core/models/product.model';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { LoginModalService } from '../../core/services/login-modal.service';
import { CartService } from '../../core/services/cart.service';
import { ContactService } from '../../core/services/contact.service';
import { ProductService } from '../../core/services/product.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { AttachmentDropComponent } from '../../components/attachment-drop/attachment-drop.component';
import { PriceComponent } from '../../components/price/price.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PriceComponent, AttachmentDropComponent, TranslatePipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  activeImageIndex = signal(0);
  quantity = 1;
  selectedColor = signal<Color | null>(null);

  addingToCart = signal(false);
  cartMessage = signal<string | null>(null);
  cartError = signal<string | null>(null);

  downloadingSheet = signal(false);

  quoteForm = { name: '', email: '', phone: '', message: '' };
  quoteAttachments: string[] = [];
  quoteUploading = signal(false);
  quoteSubmitting = signal(false);
  quoteSent = signal(false);
  quoteError = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private contactService: ContactService,
    public authService: AuthService,
    private i18n: I18nService,
    private loginModal: LoginModalService
  ) {}

  get isArchitect(): boolean {
    return this.authService.hasRole('ROLE_ARCHITECT');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) return;
      this.loading.set(true);
      this.activeImageIndex.set(0);
      this.selectedColor.set(null);
      this.productService.findBySlug(slug).subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
          this.quoteForm.message = this.i18n.t('product.quoteDefaultMessage', { name: product.name });
        },
        error: () => this.loading.set(false)
      });
    });
  }

  imageUrl(path: string): string {
    return resolveImageUrl(path);
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  selectColor(color: Color): void {
    this.selectedColor.set(color);
  }

  decreaseQty(): void {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  increaseQty(): void {
    this.quantity = this.quantity + 1;
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!this.authService.isLoggedIn()) {
      this.loginModal.open();
      return;
    }

    if (product.colors?.length && !this.selectedColor()) {
      this.cartError.set(this.i18n.t('product.selectColor'));
      return;
    }

    this.addingToCart.set(true);
    this.cartError.set(null);
    this.cartService.addItem(product.id, this.quantity, this.selectedColor()?.id).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.cartMessage.set(this.i18n.t('product.added'));
        setTimeout(() => this.cartMessage.set(null), 3000);
      },
      error: (err) => {
        this.addingToCart.set(false);
        this.cartError.set(err?.error?.message ?? this.i18n.t('product.addError'));
      }
    });
  }

  downloadTechnicalSheet(): void {
    const product = this.product();
    if (!product) return;
    this.downloadingSheet.set(true);
    this.productService.downloadTechnicalSheet(product.id).subscribe({
      next: (blob) => {
        this.downloadingSheet.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fiche-technique-${product.slug}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloadingSheet.set(false);
        alert(this.i18n.t('product.sheetError'));
      }
    });
  }

  submitQuote(): void {
    if (this.quoteUploading()) {
      return;
    }
    const product = this.product();
    this.quoteSubmitting.set(true);
    this.quoteError.set(null);
    this.contactService
      .sendQuote({
        ...this.quoteForm,
        subject: this.i18n.t('product.quoteSubject', { name: product?.name }),
        productId: product?.id,
        attachments: this.quoteAttachments
      })
      .subscribe({
        next: () => {
          this.quoteSubmitting.set(false);
          this.quoteSent.set(true);
        },
        error: () => {
          this.quoteSubmitting.set(false);
          this.quoteError.set(this.i18n.t('common.genericError'));
        }
      });
  }
}

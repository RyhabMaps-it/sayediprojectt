import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Catalogue } from '../../core/models/catalogue.model';
import { Product } from '../../core/models/product.model';
import { CatalogueService } from '../../core/services/catalogue.service';
import { ProductService } from '../../core/services/product.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { RevealDirective } from '../../components/reveal/reveal.directive';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, TranslatePipe, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);
  loading = signal(true);
  heroImage = resolveImageUrl('/images/products/claustra-skaya-2.jpg');

  catalogues = signal<Catalogue[]>([]);
  cataloguesLoading = signal(true);
  resolveImageUrl = resolveImageUrl;

  constructor(
    private productService: ProductService,
    private catalogueService: CatalogueService
  ) {}

  ngOnInit(): void {
    this.productService.findAll({ page: 0, size: 4 }).subscribe({
      next: (page) => {
        this.featuredProducts.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.catalogueService.findAll().subscribe({
      next: (catalogues) => {
        this.catalogues.set(catalogues);
        this.cataloguesLoading.set(false);
      },
      error: () => this.cataloguesLoading.set(false)
    });
  }
}

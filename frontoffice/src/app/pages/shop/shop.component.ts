import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../core/models/category.model';
import { Color } from '../../core/models/color.model';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ColorService } from '../../core/services/color.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, TranslatePipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  categories = signal<Category[]>([]);
  colors = signal<Color[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  totalPages = signal(0);
  page = signal(0);
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i));

  activeCategory = signal<string | null>(null);
  selectedColorIds = signal<number[]>([]);
  searchTerm = '';

  filteredProducts = computed(() => {
    const colorIds = this.selectedColorIds();
    if (colorIds.length === 0) return this.products();
    return this.products().filter((p) => p.colors?.some((c) => colorIds.includes(c.id)));
  });

  constructor(
    private categoryService: CategoryService,
    private colorService: ColorService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.findAll().subscribe((cats) => this.categories.set(cats));
    this.colorService.findAll().subscribe((colors) => this.colors.set(colors));

    this.route.queryParamMap.subscribe((params) => {
      this.activeCategory.set(params.get('categorie'));
      this.searchTerm = params.get('q') ?? '';
      this.page.set(0);
      this.loadProducts();
    });
  }

  selectCategory(slug: string | null): void {
    this.router.navigate([], {
      queryParams: { categorie: slug, q: this.searchTerm || null },
      queryParamsHandling: 'merge'
    });
  }

  toggleColor(colorId: number): void {
    this.selectedColorIds.update((ids) =>
      ids.includes(colorId) ? ids.filter((id) => id !== colorId) : [...ids, colorId]
    );
  }

  onSearch(): void {
    this.router.navigate([], {
      queryParams: { q: this.searchTerm || null },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  goToPage(newPage: number): void {
    this.page.set(newPage);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService
      .findAll({
        category: this.activeCategory() ?? undefined,
        search: this.searchTerm || undefined,
        page: this.page(),
        size: 9
      })
      .subscribe({
        next: (result) => {
          this.products.set(result.content);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}

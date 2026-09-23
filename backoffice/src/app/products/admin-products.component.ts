import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../core/models/product.model';
import { ProductService } from '../core/services/product.service';
import { resolveImageUrl } from '../core/utils/image-url';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminProductFormComponent } from './admin-product-form.component';
@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, AdminModalComponent, AdminProductFormComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  loading = signal(true);
  products = signal<Product[]>([]);
  search = signal('');
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);
  showFormModal = signal(false);
  editingProductId = signal<number | null>(null);
  resolveImageUrl = resolveImageUrl;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.load();
    if (this.route.snapshot.queryParamMap.get('new') === 'true') {
      this.openCreateModal();
    }
  }

  load(): void {
    this.loading.set(true);
    this.productService.findAll({ size: 100, search: this.search() || undefined }).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.load();
  }

  askDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.productService.delete(id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      }
    });
  }

  openCreateModal(): void {
    this.editingProductId.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(id: number): void {
    this.editingProductId.set(id);
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  onProductSaved(): void {
    this.showFormModal.set(false);
    this.load();
  }
}

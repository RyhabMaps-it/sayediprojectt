import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Category } from '../core/models/category.model';
import { Color } from '../core/models/color.model';
import { ProductRequest } from '../core/models/product.model';
import { CategoryService } from '../core/services/category.service';
import { ColorService } from '../core/services/color.service';
import { ProductService } from '../core/services/product.service';
import { resolveImageUrl } from '../core/utils/image-url';
import { ImageGalleryComponent } from '../shared/image-gallery/image-gallery.component';
@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageGalleryComponent],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss'
})
export class AdminProductFormComponent implements OnInit {
  @Input() productId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isEdit = signal(false);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  categories = signal<Category[]>([]);
  colors = signal<Color[]>([]);
  resolveImageUrl = resolveImageUrl;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    categoryId: [null as number | null, Validators.required],
    description: [''],
    material: [''],
    heightCm: [''],
    widthCm: [''],
    depthCm: [''],
    colorOptions: [''],
    units: [''],
    sku: [''],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    priceOnRequest: [true],
    price: [null as number | null],
    hasTechnicalSheet: [false],
    colorIds: this.fb.array<FormControl<boolean>>([]),
    images: this.fb.nonNullable.control<string[]>([])
  });

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private colorService: ColorService
  ) {}

  get colorIdsArray(): FormArray<FormControl<boolean>> {
    return this.form.controls.colorIds;
  }

  ngOnInit(): void {
    const id = this.productId;
    this.isEdit.set(id !== null);

    forkJoin({
      categories: this.categoryService.findAll(),
      colors: this.colorService.findAll()
    }).subscribe(({ categories, colors }) => {
      this.categories.set(categories);
      this.colors.set(colors);
      colors.forEach(() => this.colorIdsArray.push(this.fb.control(false, { nonNullable: true })));

      if (id !== null) {
        this.productService.findById(id).subscribe({
          next: (product) => {
            if (!product) {
              this.errorMessage.set("Produit introuvable.");
              this.loading.set(false);
              return;
            }
            const category = categories.find((c) => c.slug === product.categorySlug);
            this.form.patchValue({
              name: product.name,
              categoryId: category?.id ?? null,
              description: product.description,
              material: product.material,
              heightCm: product.heightCm,
              widthCm: product.widthCm,
              depthCm: product.depthCm,
              colorOptions: product.colorOptions,
              units: product.units,
              sku: product.sku,
              stockQuantity: product.stockQuantity,
              priceOnRequest: product.priceOnRequest,
              price: product.price,
              hasTechnicalSheet: product.hasTechnicalSheet
            });
            const selectedIds = new Set(product.colors.map((c) => c.id));
            colors.forEach((c, i) => this.colorIdsArray.at(i).setValue(selectedIds.has(c.id)));
            this.form.controls.images.setValue(product.images);
            this.loading.set(false);
          },
          error: () => {
            this.errorMessage.set("Impossible de charger le produit.");
            this.loading.set(false);
          }
        });
      } else {
        this.loading.set(false);
      }
    });
  }

  uploadsInProgress = signal(0);

  onUploadBusy(busy: boolean): void {
    this.uploadsInProgress.update((n) => Math.max(0, n + (busy ? 1 : -1)));
  }

  submit(): void {
    if (this.form.invalid || this.uploadsInProgress() > 0) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const selectedColorIds = this.colors()
      .filter((_, i) => this.colorIdsArray.at(i).value)
      .map((c) => c.id);

    const request: ProductRequest = {
      name: raw.name!,
      categoryId: raw.categoryId!,
      description: raw.description ?? '',
      material: raw.material ?? '',
      heightCm: raw.heightCm ?? '',
      widthCm: raw.widthCm ?? '',
      depthCm: raw.depthCm ?? '',
      colorOptions: raw.colorOptions ?? '',
      units: raw.units ?? '',
      colorIds: selectedColorIds,
      price: raw.priceOnRequest ? null : raw.price,
      priceOnRequest: raw.priceOnRequest!,
      hasTechnicalSheet: raw.hasTechnicalSheet!,
      sku: raw.sku ?? '',
      stockQuantity: raw.stockQuantity!,
      images: raw.images
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    const id = this.productId;
    const action = id !== null ? this.productService.update(id, request) : this.productService.create(request);

    action.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? "Une erreur est survenue lors de l'enregistrement.");
        this.saving.set(false);
      }
    });
  }
}

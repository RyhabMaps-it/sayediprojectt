import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Catalogue } from '../core/models/catalogue.model';
import { CatalogueService } from '../core/services/catalogue.service';
import { resolveImageUrl } from '../core/utils/image-url';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { FileDropComponent } from '../shared/file-drop/file-drop.component';
@Component({
  selector: 'app-admin-catalogues',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminModalComponent, FileDropComponent],
  templateUrl: './admin-catalogues.component.html',
  styleUrl: './admin-catalogues.component.scss'
})
export class AdminCataloguesComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  catalogues = signal<Catalogue[]>([]);
  deletingId = signal<number | null>(null);
  showAddModal = signal(false);
  resolveImageUrl = resolveImageUrl;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', Validators.required],
    fileUrl: ['', Validators.required],
    coverImageUrl: ['']
  });

  uploadsInProgress = signal(0);

  onUploadBusy(busy: boolean): void {
    this.uploadsInProgress.update((n) => Math.max(0, n + (busy ? 1 : -1)));
  }

  constructor(private catalogueService: CatalogueService) {}

  ngOnInit(): void {
    this.load();
  }

  openAddModal(): void {
    this.errorMessage.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.form.reset({ title: '', fileUrl: '', coverImageUrl: '' });
  }

  load(): void {
    this.loading.set(true);
    this.catalogueService.findAll().subscribe({
      next: (catalogues) => {
        this.catalogues.set(catalogues);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid || this.uploadsInProgress() > 0) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const { title, fileUrl, coverImageUrl } = this.form.getRawValue();
    this.catalogueService
      .create({ title: title!, fileUrl: fileUrl!, coverImageUrl: coverImageUrl?.trim() || null })
      .subscribe({
        next: (catalogue) => {
          this.catalogues.update((list) => [...list, catalogue]);
          this.form.reset({ title: '', fileUrl: '', coverImageUrl: '' });
          this.saving.set(false);
          this.showAddModal.set(false);
        },
        error: () => {
          this.errorMessage.set("Impossible d'ajouter ce catalogue.");
          this.saving.set(false);
        }
      });
  }

  delete(id: number): void {
    this.deletingId.set(id);
    this.catalogueService.delete(id).subscribe({
      next: () => {
        this.catalogues.update((list) => list.filter((c) => c.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Impossible de supprimer ce catalogue.');
        this.deletingId.set(null);
      }
    });
  }
}

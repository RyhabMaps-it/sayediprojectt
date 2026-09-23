import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Color } from '../core/models/color.model';
import { ColorService } from '../core/services/color.service';
import { resolveImageUrl } from '../core/utils/image-url';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { FileDropComponent } from '../shared/file-drop/file-drop.component';
@Component({
  selector: 'app-admin-colors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminModalComponent, FileDropComponent],
  templateUrl: './admin-colors.component.html',
  styleUrl: './admin-colors.component.scss'
})
export class AdminColorsComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  colors = signal<Color[]>([]);
  deletingId = signal<number | null>(null);
  showAddModal = signal(false);
  resolveImageUrl = resolveImageUrl;

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    code: ['#7a1f2c', Validators.required],
    imageUrl: ['']
  });

  uploadsInProgress = signal(0);

  onUploadBusy(busy: boolean): void {
    this.uploadsInProgress.update((n) => Math.max(0, n + (busy ? 1 : -1)));
  }

  constructor(private colorService: ColorService) {}

  ngOnInit(): void {
    this.load();
  }

  openAddModal(): void {
    this.errorMessage.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.form.reset({ name: '', code: '#7a1f2c', imageUrl: '' });
  }

  load(): void {
    this.loading.set(true);
    this.colorService.findAll().subscribe({
      next: (colors) => {
        this.colors.set(colors);
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
    const { name, code, imageUrl } = this.form.getRawValue();
    this.colorService.create({ name: name!, code: code!, imageUrl: imageUrl?.trim() || null }).subscribe({
      next: (color) => {
        this.colors.update((list) => [...list, color]);
        this.form.reset({ name: '', code: '#7a1f2c', imageUrl: '' });
        this.saving.set(false);
        this.showAddModal.set(false);
      },
      error: () => {
        this.errorMessage.set("Impossible d'ajouter ce coloris.");
        this.saving.set(false);
      }
    });
  }

  delete(id: number): void {
    this.deletingId.set(id);
    this.colorService.delete(id).subscribe({
      next: () => {
        this.colors.update((list) => list.filter((c) => c.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Ce coloris est peut-être utilisé par un produit et ne peut être supprimé.');
        this.deletingId.set(null);
      }
    });
  }
}

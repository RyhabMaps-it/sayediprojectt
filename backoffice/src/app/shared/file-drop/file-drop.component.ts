import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { UploadKind, acceptFor, validateUpload } from '../../core/utils/upload-validation';

@Component({
  selector: 'app-file-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-drop.component.html',
  styleUrl: './file-drop.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileDropComponent), multi: true }]
})
export class FileDropComponent implements ControlValueAccessor, OnDestroy {
  @Input() kind: UploadKind = 'image';
  @Input() hint = '';
  @Input() compact = false;
  @Output() busyChange = new EventEmitter<boolean>();

  value = signal<string | null>(null);
  localPreview = signal<string | null>(null);
  fileName = signal<string | null>(null);
  uploading = signal(false);
  dragOver = signal(false);
  error = signal<string | null>(null);
  disabled = signal(false);

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private uploadService: UploadService) {}

  get accept(): string {
    return acceptFor(this.kind);
  }

  get previewSrc(): string | null {
    return this.localPreview() ?? (this.value() ? resolveImageUrl(this.value()) : null);
  }

  get fileHref(): string | null {
    return this.value() ? resolveImageUrl(this.value()) : null;
  }

  writeValue(value: string | null): void {
    this.value.set(value || null);
    this.fileName.set(null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.uploading()) {
      this.dragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.upload(file);
    }
  }

  clear(): void {
    this.revokePreview();
    this.value.set(null);
    this.fileName.set(null);
    this.error.set(null);
    this.onChange(null);
    this.onTouched();
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  private upload(file: File): void {
    if (this.uploading() || this.disabled()) {
      return;
    }
    const validationError = validateUpload(file, this.kind);
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    this.error.set(null);
    this.revokePreview();
    if (this.kind === 'image') {
      this.localPreview.set(URL.createObjectURL(file));
    }
    this.fileName.set(file.name);
    this.uploading.set(true);
    this.busyChange.emit(true);

    this.uploadService.upload(file).subscribe({
      next: (url) => {
        this.value.set(url);
        this.uploading.set(false);
        this.busyChange.emit(false);
        this.onChange(url);
        this.onTouched();
      },
      error: (err) => {
        this.revokePreview();
        this.fileName.set(null);
        this.uploading.set(false);
        this.busyChange.emit(false);
        this.error.set(err?.error?.message ?? "Échec de l'envoi. Réessayez.");
      }
    });
  }

  private revokePreview(): void {
    const preview = this.localPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
      this.localPreview.set(null);
    }
  }
}

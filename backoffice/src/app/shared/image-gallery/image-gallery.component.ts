import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import { resolveImageUrl } from '../../core/utils/image-url';
import { acceptFor, validateUpload } from '../../core/utils/upload-validation';

interface PendingUpload {
  id: number;
  preview: string;
}

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ImageGalleryComponent), multi: true }]
})
export class ImageGalleryComponent implements ControlValueAccessor, OnDestroy {
  @Output() busyChange = new EventEmitter<boolean>();

  images = signal<string[]>([]);
  pending = signal<PendingUpload[]>([]);
  dragOver = signal(false);
  error = signal<string | null>(null);
  disabled = signal(false);

  readonly accept = acceptFor('image');
  resolveImageUrl = resolveImageUrl;

  private nextId = 0;
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private uploadService: UploadService) {}

  writeValue(value: string[] | null): void {
    this.images.set((value ?? []).filter((url) => !!url?.trim()));
  }

  registerOnChange(fn: (value: string[]) => void): void {
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
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.uploadFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.uploadFiles(files);
  }

  remove(index: number): void {
    this.images.update((list) => list.filter((_, i) => i !== index));
    this.emit();
  }

  makeMain(index: number): void {
    this.images.update((list) => [list[index], ...list.filter((_, i) => i !== index)]);
    this.emit();
  }

  move(index: number, delta: number): void {
    const target = index + delta;
    this.images.update((list) => {
      if (target < 0 || target >= list.length) {
        return list;
      }
      const copy = [...list];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    this.emit();
  }

  ngOnDestroy(): void {
    this.pending().forEach((p) => URL.revokeObjectURL(p.preview));
  }

  private uploadFiles(files: File[]): void {
    if (this.disabled() || files.length === 0) {
      return;
    }
    this.error.set(null);

    for (const file of files) {
      const validationError = validateUpload(file, 'image');
      if (validationError) {
        this.error.set(`${file.name} : ${validationError}`);
        continue;
      }

      const item: PendingUpload = { id: this.nextId++, preview: URL.createObjectURL(file) };
      if (this.pending().length === 0) {
        this.busyChange.emit(true);
      }
      this.pending.update((list) => [...list, item]);

      this.uploadService.upload(file).subscribe({
        next: (url) => {
          this.finishPending(item);
          this.images.update((list) => [...list, url]);
          this.emit();
        },
        error: (err) => {
          this.finishPending(item);
          this.error.set(`${file.name} : ${err?.error?.message ?? "échec de l'envoi."}`);
        }
      });
    }
  }

  private finishPending(item: PendingUpload): void {
    URL.revokeObjectURL(item.preview);
    this.pending.update((list) => list.filter((p) => p.id !== item.id));
    if (this.pending().length === 0) {
      this.busyChange.emit(false);
    }
  }

  private emit(): void {
    this.onChange(this.images());
    this.onTouched();
  }
}

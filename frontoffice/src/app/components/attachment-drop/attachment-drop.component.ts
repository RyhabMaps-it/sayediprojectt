import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { AttachmentService } from '../../core/services/attachment.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;

export interface Attachment {
  id: number;
  name: string;
  isPdf: boolean;
  preview: string | null;
  url: string | null;
  uploading: boolean;
}

@Component({
  selector: 'app-attachment-drop',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './attachment-drop.component.html',
  styleUrl: './attachment-drop.component.scss'
})
export class AttachmentDropComponent implements OnDestroy {
  @Input() maxFiles = 5;
  @Input() compact = false;
  @Output() urlsChange = new EventEmitter<string[]>();
  @Output() busyChange = new EventEmitter<boolean>();

  readonly accept = ALLOWED_TYPES.join(',');

  items = signal<Attachment[]>([]);
  dragOver = signal(false);
  error = signal<string | null>(null);

  private nextId = 0;

  constructor(
    private attachmentService: AttachmentService,
    private i18n: I18nService
  ) {}

  get remaining(): number {
    return this.maxFiles - this.items().length;
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
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.addFiles(files);
  }

  remove(id: number): void {
    const item = this.items().find((i) => i.id === id);
    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }
    this.items.update((list) => list.filter((i) => i.id !== id));
    this.error.set(null);
    this.emit();
  }

  ngOnDestroy(): void {
    this.items().forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
  }

  private addFiles(files: File[]): void {
    this.error.set(null);
    for (const file of files) {
      if (this.remaining <= 0) {
        this.error.set(this.i18n.t('attachments.tooMany', { max: this.maxFiles }));
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.error.set(this.i18n.t('attachments.badType', { name: file.name }));
        continue;
      }
      if (file.size > MAX_BYTES) {
        this.error.set(this.i18n.t('attachments.tooBig', { name: file.name }));
        continue;
      }
      this.upload(file);
    }
  }

  private upload(file: File): void {
    const isPdf = file.type === 'application/pdf';
    const item: Attachment = {
      id: this.nextId++,
      name: file.name,
      isPdf,
      preview: isPdf ? null : URL.createObjectURL(file),
      url: null,
      uploading: true
    };
    this.items.update((list) => [...list, item]);
    this.emitBusy();

    this.attachmentService.upload(file).subscribe({
      next: (url) => {
        this.items.update((list) => list.map((i) => (i.id === item.id ? { ...i, url, uploading: false } : i)));
        this.emit();
        this.emitBusy();
      },
      error: (err) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
        this.items.update((list) => list.filter((i) => i.id !== item.id));
        this.error.set(err?.error?.message ? `${file.name} : ${err.error.message}` : this.i18n.t('attachments.failed', { name: file.name }));
        this.emitBusy();
      }
    });
  }

  private emit(): void {
    this.urlsChange.emit(this.items().filter((i) => i.url).map((i) => i.url!));
  }

  private emitBusy(): void {
    this.busyChange.emit(this.items().some((i) => i.uploading));
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { resolveImageUrl } from '../../core/utils/image-url';

/** Read-only list of files attached by a visitor: image thumbnails and PDF tiles, each opening in a new tab. */
@Component({
  selector: 'app-attachment-thumbs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attachment-thumbs.component.html',
  styleUrl: './attachment-thumbs.component.scss'
})
export class AttachmentThumbsComponent {
  @Input() files: string[] | null | undefined = [];
  @Input() size: 'sm' | 'md' = 'md';

  resolveImageUrl = resolveImageUrl;

  isPdf(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss'
})
export class AdminModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'md' | 'lg' = 'md';
  @Output() closed = new EventEmitter<void>();

  ngOnChanges(): void {
    document.body.style.overflow = this.open ? 'hidden' : '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  onOverlayClick(): void {
    this.closed.emit();
  }
}

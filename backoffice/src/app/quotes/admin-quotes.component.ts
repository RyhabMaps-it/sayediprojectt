import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Quote } from '../core/models/quote.model';
import { QuoteService } from '../core/services/quote.service';
import { AttachmentThumbsComponent } from '../shared/attachment-thumbs/attachment-thumbs.component';
@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, AttachmentThumbsComponent],
  templateUrl: './admin-quotes.component.html',
  styleUrl: './admin-quotes.component.scss'
})
export class AdminQuotesComponent implements OnInit {
  loading = signal(true);
  quotes = signal<Quote[]>([]);
  processingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  constructor(private quoteService: QuoteService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.quoteService.findAll().subscribe({
      next: (list) => {
        this.quotes.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  askDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.processingId.set(id);
    this.quoteService.delete(id).subscribe({
      next: () => {
        this.quotes.update((list) => list.filter((q) => q.id !== id));
        this.processingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.processingId.set(null);
        this.confirmDeleteId.set(null);
      }
    });
  }
}

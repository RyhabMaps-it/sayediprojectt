import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Collaboration } from '../core/models/collaboration.model';
import { CollaborationService } from '../core/services/collaboration.service';
import { AttachmentThumbsComponent } from '../shared/attachment-thumbs/attachment-thumbs.component';
@Component({
  selector: 'app-admin-collaborations',
  standalone: true,
  imports: [CommonModule, AttachmentThumbsComponent],
  templateUrl: './admin-collaborations.component.html',
  styleUrl: './admin-collaborations.component.scss'
})
export class AdminCollaborationsComponent implements OnInit {
  loading = signal(true);
  collaborations = signal<Collaboration[]>([]);
  processingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  constructor(private collaborationService: CollaborationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.collaborationService.findAll().subscribe({
      next: (list) => {
        this.collaborations.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  accept(id: number): void {
    this.processingId.set(id);
    this.collaborationService.accept(id).subscribe({
      next: (updated) => {
        this.collaborations.update((list) => list.map((c) => (c.id === id ? updated : c)));
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null)
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
    this.collaborationService.delete(id).subscribe({
      next: () => {
        this.collaborations.update((list) => list.filter((c) => c.id !== id));
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

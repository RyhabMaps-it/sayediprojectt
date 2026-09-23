import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttachmentDropComponent } from '../../components/attachment-drop/attachment-drop.component';
import { Collaboration } from '../../core/models/collaboration.model';
import { AuthService } from '../../core/services/auth.service';
import { CollaborationService } from '../../core/services/collaboration.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-collaboration',
  standalone: true,
  imports: [CommonModule, FormsModule, AttachmentDropComponent, TranslatePipe],
  templateUrl: './collaboration.component.html',
  styleUrl: './collaboration.component.scss'
})
export class CollaborationComponent implements OnInit {
  form = { phone: '', message: '' };
  attachments: string[] = [];
  uploading = signal(false);
  submitting = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);
  myRequests = signal<Collaboration[]>([]);
  loading = signal(true);

  private i18n = inject(I18nService);

  constructor(
    private collaborationService: CollaborationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.collaborationService.findMine().subscribe({
      next: (requests) => {
        this.myRequests.set(requests);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.uploading()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.collaborationService.submit({ ...this.form, attachments: this.attachments }).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.sent.set(true);
        this.myRequests.update((list) => [created, ...list]);
        this.form = { phone: '', message: '' };
      },
      error: () => {
        this.submitting.set(false);
        this.error.set(this.i18n.t('common.genericError'));
      }
    });
  }
}

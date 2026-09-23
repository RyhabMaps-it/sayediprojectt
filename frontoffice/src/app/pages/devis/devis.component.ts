import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttachmentDropComponent } from '../../components/attachment-drop/attachment-drop.component';
import { ContactService } from '../../core/services/contact.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, FormsModule, AttachmentDropComponent, TranslatePipe],
  templateUrl: './devis.component.html',
  styleUrl: './devis.component.scss'
})
export class DevisComponent {
  form = { name: '', email: '', phone: '', subject: '', message: '' };
  attachments: string[] = [];
  uploading = signal(false);
  submitting = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  private i18n = inject(I18nService);

  constructor(private contactService: ContactService) {}

  submit(): void {
    if (this.uploading()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.contactService.sendQuote({ ...this.form, attachments: this.attachments }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set(this.i18n.t('common.genericError'));
      }
    });
  }
}

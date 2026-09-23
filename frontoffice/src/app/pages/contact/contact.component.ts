import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  form = { name: '', email: '', phone: '', subject: '', message: '' };
  submitting = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);

  private i18n = inject(I18nService);

  constructor(private contactService: ContactService) {}

  submit(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.contactService.sendContact(this.form).subscribe({
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

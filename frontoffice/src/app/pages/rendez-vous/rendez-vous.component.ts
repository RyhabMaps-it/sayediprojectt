import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttachmentDropComponent } from '../../components/attachment-drop/attachment-drop.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports: [CommonModule, FormsModule, AttachmentDropComponent, TranslatePipe],
  templateUrl: './rendez-vous.component.html',
  styleUrl: './rendez-vous.component.scss'
})
export class RendezVousComponent {
  form = { name: '', email: '', phone: '', date: '', time: '', message: '' };
  attachments: string[] = [];
  uploading = signal(false);
  submitting = signal(false);
  sent = signal(false);
  error = signal<string | null>(null);
  minDate = new Date().toISOString().split('T')[0];

  availableTimes = [
    '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  private i18n = inject(I18nService);

  constructor(private appointmentService: AppointmentService) {}

  submit(): void {
    if (this.uploading()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    this.appointmentService.submit({ ...this.form, attachments: this.attachments }).subscribe({
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

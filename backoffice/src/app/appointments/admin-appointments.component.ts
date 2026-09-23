import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Appointment } from '../core/models/appointment.model';
import { AppointmentService } from '../core/services/appointment.service';
import { AttachmentThumbsComponent } from '../shared/attachment-thumbs/attachment-thumbs.component';
@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, AttachmentThumbsComponent],
  templateUrl: './admin-appointments.component.html',
  styleUrl: './admin-appointments.component.scss'
})
export class AdminAppointmentsComponent implements OnInit {
  loading = signal(true);
  appointments = signal<Appointment[]>([]);
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  sorted = computed(() =>
    [...this.appointments()].sort((a, b) => (a.date + a.time > b.date + b.time ? -1 : 1))
  );

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.appointmentService.findAll().subscribe({
      next: (list) => {
        this.appointments.set(list);
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
    this.deletingId.set(id);
    this.appointmentService.delete(id).subscribe({
      next: () => {
        this.appointments.update((list) => list.filter((a) => a.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      }
    });
  }
}

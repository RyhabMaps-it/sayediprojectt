import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Appointment } from '../core/models/appointment.model';
import { Collaboration } from '../core/models/collaboration.model';
import { AppointmentService } from '../core/services/appointment.service';
import { AuthService } from '../core/services/auth.service';
import { CollaborationService } from '../core/services/collaboration.service';
import { ColorService } from '../core/services/color.service';
import { ProductService } from '../core/services/product.service';
interface DashboardStats {
  productCount: number;
  colorCount: number;
  pendingAppointments: number;
  pendingCollaborations: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<DashboardStats>({ productCount: 0, colorCount: 0, pendingAppointments: 0, pendingCollaborations: 0 });
  recentAppointments = signal<Appointment[]>([]);
  recentCollaborations = signal<Collaboration[]>([]);

  private readonly today = new Date();
  todayDay = this.today.getDate();
  todayMonthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this.today);

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private colorService: ColorService,
    private appointmentService: AppointmentService,
    private collaborationService: CollaborationService
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productService.findAll({ size: 1 }),
      colors: this.colorService.findAll(),
      appointments: this.appointmentService.findAll(),
      collaborations: this.collaborationService.findAll()
    }).subscribe({
      next: ({ products, colors, appointments, collaborations }) => {
        this.stats.set({
          productCount: products.totalElements,
          colorCount: colors.length,
          pendingAppointments: appointments.filter((a) => a.status === 'PENDING').length,
          pendingCollaborations: collaborations.filter((c) => c.status === 'PENDING').length
        });
        this.recentAppointments.set(appointments.slice(0, 5));
        this.recentCollaborations.set(collaborations.slice(0, 5));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

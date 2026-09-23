export interface AppointmentRequest {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  message?: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  message?: string;
  status: AppointmentStatus;
  attachments: string[];
}

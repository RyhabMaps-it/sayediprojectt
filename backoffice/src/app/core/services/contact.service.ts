import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  productId?: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  sendContact(request: ContactRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/contact`, request);
  }

  sendQuote(request: QuoteRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/quotes`, request);
  }
}

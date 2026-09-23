import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quote } from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly baseUrl = `${environment.apiUrl}/quotes`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.baseUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

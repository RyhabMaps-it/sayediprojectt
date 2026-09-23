import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Collaboration, CollaborationRequest } from '../models/collaboration.model';

@Injectable({ providedIn: 'root' })
export class CollaborationService {
  private readonly baseUrl = `${environment.apiUrl}/collaborations`;

  constructor(private http: HttpClient) {}

  submit(request: CollaborationRequest): Observable<Collaboration> {
    return this.http.post<Collaboration>(this.baseUrl, request);
  }

  findMine(): Observable<Collaboration[]> {
    return this.http.get<Collaboration[]>(`${this.baseUrl}/me`);
  }

  findAll(): Observable<Collaboration[]> {
    return this.http.get<Collaboration[]>(this.baseUrl);
  }

  accept(id: number): Observable<Collaboration> {
    return this.http.patch<Collaboration>(`${this.baseUrl}/${id}/accept`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

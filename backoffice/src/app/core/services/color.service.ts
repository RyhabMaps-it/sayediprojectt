import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Color, ColorRequest } from '../models/color.model';

@Injectable({ providedIn: 'root' })
export class ColorService {
  private readonly baseUrl = `${environment.apiUrl}/colors`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Color[]> {
    return this.http.get<Color[]>(this.baseUrl);
  }

  create(request: ColorRequest): Observable<Color> {
    return this.http.post<Color>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

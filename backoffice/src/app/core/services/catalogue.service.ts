import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Catalogue, CatalogueRequest } from '../models/catalogue.model';

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private readonly baseUrl = `${environment.apiUrl}/catalogues`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Catalogue[]> {
    return this.http.get<Catalogue[]>(this.baseUrl);
  }

  create(request: CatalogueRequest): Observable<Catalogue> {
    return this.http.post<Catalogue>(this.baseUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly baseUrl = `${environment.apiUrl}/admin/uploads`;

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<string> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<{ url: string }>(this.baseUrl, body).pipe(map((res) => res.url));
  }
}

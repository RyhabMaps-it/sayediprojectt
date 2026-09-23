import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, Product, ProductRequest } from '../models/product.model';

export interface ProductQuery {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAll(query: ProductQuery = {}): Observable<Page<Product>> {
    let params = new HttpParams();
    if (query.category) params = params.set('category', query.category);
    if (query.search) params = params.set('search', query.search);
    params = params.set('page', query.page ?? 0);
    params = params.set('size', query.size ?? 12);

    return this.http.get<Page<Product>>(this.baseUrl, { params });
  }

  findBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${slug}`);
  }

  /** No admin get-by-id endpoint exists on the API; resolve it from the full catalog instead. */
  findById(id: number): Observable<Product | undefined> {
    return this.findAll({ size: 500 }).pipe(map((page) => page.content.find((p) => p.id === id)));
  }

  downloadTechnicalSheet(productId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${productId}/technical-sheet`, { responseType: 'blob' });
  }

  create(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/admin`, request);
  }

  update(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/admin/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/${id}`);
  }
}

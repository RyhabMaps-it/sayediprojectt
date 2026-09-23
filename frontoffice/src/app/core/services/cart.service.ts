import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/cart`;

  private cartSignal = signal<Cart | null>(null);
  readonly cart = this.cartSignal.asReadonly();
  readonly itemCount = computed(() =>
    (this.cartSignal()?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)
  );

  constructor(private http: HttpClient) {}

  refresh(): Observable<Cart> {
    return this.http.get<Cart>(this.baseUrl).pipe(tap((cart) => this.cartSignal.set(cart)));
  }

  addItem(productId: number, quantity = 1, colorId?: number | null): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.baseUrl}/items`, { productId, quantity, colorId })
      .pipe(tap((cart) => this.cartSignal.set(cart)));
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http
      .put<Cart>(`${this.baseUrl}/items/${itemId}`, { quantity })
      .pipe(tap((cart) => this.cartSignal.set(cart)));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.baseUrl}/items/${itemId}`)
      .pipe(tap((cart) => this.cartSignal.set(cart)));
  }

  clear(): Observable<Cart> {
    return this.http.delete<Cart>(this.baseUrl).pipe(tap((cart) => this.cartSignal.set(cart)));
  }

  reset(): void {
    this.cartSignal.set(null);
  }
}

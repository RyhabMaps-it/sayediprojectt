import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, ShippingAddress } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  checkout(shippingAddress: ShippingAddress): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/checkout`, { shippingAddress });
  }

  myOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  findOne(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }
}

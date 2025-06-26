import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuItem } from './menu.service';

export interface OrderItem {
  item: MenuItem;
  quantity: number;
}

export interface Order {
  tableId: number;
  items: OrderItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = new BehaviorSubject<Order[]>([]);

  constructor() { }

  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  addOrder(tableId: number, items: OrderItem[]): void {
    const currentOrders = this.orders.getValue();
    const total = items.reduce((acc, orderItem) => acc + (orderItem.item.price * orderItem.quantity), 0);
    const newOrder: Order = { tableId, items, total };
    currentOrders.push(newOrder);
    this.orders.next(currentOrders);
  }

  updateOrder(tableId: number, items: OrderItem[]): void {
    const currentOrders = this.orders.getValue();
    const orderIndex = currentOrders.findIndex(o => o.tableId === tableId);
    if (orderIndex > -1) {
      const total = items.reduce((acc, orderItem) => acc + (orderItem.item.price * orderItem.quantity), 0);
      currentOrders[orderIndex] = { ...currentOrders[orderIndex], items, total };
      this.orders.next(currentOrders);
    }
  }

  getOrderByTable(tableId: number): Order | undefined {
    return this.orders.getValue().find(o => o.tableId === tableId);
  }
}

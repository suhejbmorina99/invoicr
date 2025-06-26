import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuService, MenuItem } from '../services/menu.service';
import { OrderService, OrderItem } from '../services/order.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menu: { [key: string]: MenuItem[] } = {};
  order: { [itemId: number]: number } = {};

  constructor(
    public dialogRef: MatDialogRef<MenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tableId: number },
    private menuService: MenuService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(items => {
      this.menu = items.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
      }, {} as { [key: string]: MenuItem[] });
    });

    const existingOrder = this.orderService.getOrderByTable(this.data.tableId);
    if (existingOrder) {
      this.order = existingOrder.items.reduce((acc, orderItem) => {
        acc[orderItem.item.id] = orderItem.quantity;
        return acc;
      }, {} as { [itemId: number]: number });
    }
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.menu);
  }

  addToOrder(item: MenuItem): void {
    this.order[item.id] = (this.order[item.id] || 0) + 1;
  }

  removeFromOrder(item: MenuItem): void {
    if (this.order[item.id] > 0) {
      this.order[item.id]--;
    }
  }

  getOrderItem(item: MenuItem): OrderItem | undefined {
    const quantity = this.order[item.id];
    return quantity > 0 ? { item, quantity } : undefined;
  }

  getOrderItems(): OrderItem[] {
    return Object.keys(this.order)
      .map(itemId => {
        const item = this.findMenuItemById(Number(itemId));
        return item ? this.getOrderItem(item) : undefined;
      })
      .filter((orderItem): orderItem is OrderItem => orderItem !== undefined);
  }

  findMenuItemById(id: number): MenuItem | undefined {
    return Object.values(this.menu).flat().find(item => item.id === id);
  }

  onSave(): void {
    const orderItems = this.getOrderItems();
    if (orderItems.length > 0) {
      this.orderService.addOrder(this.data.tableId, orderItems);
    }
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
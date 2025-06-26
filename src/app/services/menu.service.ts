import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] = [
    // Appetizers
    { id: 1, name: 'Spring Rolls', price: 5.99, category: 'Appetizer' },
    { id: 2, name: 'Garlic Bread', price: 4.50, category: 'Appetizer' },
    { id: 3, name: 'Bruschetta', price: 6.50, category: 'Appetizer' },

    // Main Courses
    { id: 4, name: 'Spaghetti Carbonara', price: 12.99, category: 'Main Course' },
    { id: 5, name: 'Grilled Salmon', price: 15.50, category: 'Main Course' },
    { id: 6, name: 'Chicken Alfredo', price: 13.75, category: 'Main Course' },
    { id: 7, name: 'Steak Frites', price: 18.00, category: 'Main Course' },

    // Desserts
    { id: 8, name: 'Chocolate Lava Cake', price: 7.25, category: 'Dessert' },
    { id: 9, name: 'Cheesecake', price: 6.75, category: 'Dessert' },
    { id: 10, name: 'Tiramisu', price: 7.50, category: 'Dessert' },

    // Beverages
    { id: 11, name: 'Coca-Cola', price: 2.50, category: 'Beverage' },
    { id: 12, name: 'Orange Juice', price: 3.00, category: 'Beverage' },
    { id: 13, name: 'Espresso', price: 2.75, category: 'Beverage' }
  ];

  constructor() { }

  getMenuItems(): Observable<MenuItem[]> {
    return of(this.menuItems);
  }
}

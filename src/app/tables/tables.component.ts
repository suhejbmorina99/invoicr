import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Table {
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {
  twoPersonTables: Table[] = [
    { number: 1, capacity: 2, status: 'available' },
    { number: 2, capacity: 2, status: 'available' }
  ];

  threePersonTables: Table[] = [
    { number: 3, capacity: 3, status: 'available' },
    { number: 4, capacity: 3, status: 'available' }
  ];

  fourPersonTables: Table[] = [
    { number: 5, capacity: 4, status: 'available' },
    { number: 6, capacity: 4, status: 'available' },
    { number: 7, capacity: 4, status: 'available' }
  ];

  sixPersonTables: Table[] = [
    { number: 8, capacity: 6, status: 'available' },
    { number: 9, capacity: 6, status: 'available' },
    { number: 10, capacity: 6, status: 'available' }
  ];
}

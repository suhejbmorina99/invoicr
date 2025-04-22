import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TableStatus = 'available' | 'reserved' | 'occupied';

interface Table {
  id: number;
  capacity: number;
  status: TableStatus;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {
  tables: Table[] = [
    { id: 1, capacity: 6, status: 'available' },
    { id: 2, capacity: 2, status: 'reserved' },
    { id: 3, capacity: 2, status: 'available' },
    { id: 4, capacity: 4, status: 'occupied' },
    { id: 5, capacity: 6, status: 'available' },
    { id: 6, capacity: 8, status: 'reserved' }
  ];

  getTableStatus(tableId: number): TableStatus {
    const table = this.tables.find(t => t.id === tableId);
    return table ? table.status : 'available';
  }

  onTableClick(tableId: number) {
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      // Cycle through statuses: available -> reserved -> occupied -> available
      if (table.status === 'available') table.status = 'reserved';
      else if (table.status === 'reserved') table.status = 'occupied';
      else table.status = 'available';
    }
  }
}

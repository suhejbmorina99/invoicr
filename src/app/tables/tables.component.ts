import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TableStatus = 'available' | 'reserved' | 'occupied';

interface Position {
  x: number;
  y: number;
}

interface Table {
  id: number;
  capacity: number;
  status: TableStatus;
  position: Position;
  width: number;
  height: number;
  rotation: number;
  isDragging?: boolean;
  isRotating?: boolean;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private tableImage: HTMLImageElement;
  private chairImage: HTMLImageElement;
  private rotateImage: HTMLImageElement;
  private imagesLoaded = 0;
  private readonly ROTATE_HANDLE_SIZE = 20;
  
  tables: Table[] = [];
  newTable = {
    capacity: 4
  };
  
  selectedTable: Table | null = null;
  isDragging = false;
  isRotating = false;
  dragStartX = 0;
  dragStartY = 0;
  rotationStart = 0;

  validateKeyPress(event: KeyboardEvent): boolean {
    // Allow backspace and delete
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    }
    // Only allow numbers 1-8
    return event.charCode >= 49 && event.charCode <= 56;
  }

  validateCapacity(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // Allow empty input
    if (input.value === '') {
      return;
    }

    // Parse the input value
    let value = parseInt(input.value);
    
    // If it's not a valid number, don't do anything
    if (isNaN(value)) {
      return;
    }

    // Ensure the value is between 1 and 8
    if (value > 8) {
      value = 8;
      input.value = '8';
      this.newTable.capacity = 8;
    } else if (value < 1) {
      value = 1;
      input.value = '1';
      this.newTable.capacity = 1;
    } else {
      this.newTable.capacity = value;
    }
  }

  constructor() {
    this.tableImage = new Image();
    this.chairImage = new Image();
    this.rotateImage = new Image();
    
    this.tableImage.onload = () => {
      this.imagesLoaded++;
      if (this.imagesLoaded === 3) this.draw();
    };
    
    this.chairImage.onload = () => {
      this.imagesLoaded++;
      if (this.imagesLoaded === 3) this.draw();
    };

    this.rotateImage.onload = () => {
      this.imagesLoaded++;
      if (this.imagesLoaded === 3) this.draw();
    };
    
    this.tableImage.src = 'assets/icons/table.svg';
    this.chairImage.src = 'assets/icons/chair.svg';
    this.rotateImage.src = 'assets/icons/rotate.svg';
  }

  private getTableDimensions(capacity: number): { width: number; height: number } {
    if (capacity <= 2) return { width: 100, height: 120 };
    if (capacity <= 3) return { width: 120, height: 140 };
    if (capacity <= 5) return { width: 120, height: 160 };
    return { width: 160, height: 180 }; // 6-8 seats
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    canvas.width = 800;
    canvas.height = 600;
    
    this.loadLayout();
    if (this.imagesLoaded === 3) this.draw();
    
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private drawRotateHandle(table: Table) {
    // Only draw handle if table is selected
    if (this.selectedTable !== table) return;

    // Position handle slightly away from table edge
    const handleX = table.position.x + table.width - this.ROTATE_HANDLE_SIZE/2;
    const handleY = table.position.y - this.ROTATE_HANDLE_SIZE/2;
    
    this.ctx.save();
    this.ctx.translate(handleX + this.ROTATE_HANDLE_SIZE/2, handleY + this.ROTATE_HANDLE_SIZE/2);
    this.ctx.rotate(table.rotation);
    this.ctx.drawImage(
      this.rotateImage,
      -this.ROTATE_HANDLE_SIZE/2,
      -this.ROTATE_HANDLE_SIZE/2,
      this.ROTATE_HANDLE_SIZE,
      this.ROTATE_HANDLE_SIZE
    );
    this.ctx.restore();
  }

  private isOverRotateHandle(table: Table, x: number, y: number): boolean {
    // Allow checking rotation handle even if table isn't currently selected
    const handleX = table.position.x + table.width - this.ROTATE_HANDLE_SIZE/2;
    const handleY = table.position.y - this.ROTATE_HANDLE_SIZE/2;
    
    return x >= handleX && x <= handleX + this.ROTATE_HANDLE_SIZE &&
           y >= handleY && y <= handleY + this.ROTATE_HANDLE_SIZE;
  }

  addTable() {
    const capacity = Math.min(Math.max(1, Math.floor(this.newTable.capacity)), 8);
    const dimensions = this.getTableDimensions(capacity);
    const table: Table = {
      id: this.tables.length + 1,
      capacity: capacity,
      status: 'available',
      position: { x: 50, y: 50 },
      rotation: 0,
      ...dimensions
    };
    
    this.tables.push(table);
    this.draw();
  }

  private drawTable(table: Table) {
    const x = table.position.x;
    const y = table.position.y;
    const { width, height } = table;
    const chairSize = 24;
    const chairMargin = 5;
    
    const borderColor = this.getTableBorderColor(table.status);
    
    const tableRect = {
      x: x + chairSize + chairMargin,
      y: y + chairSize + chairMargin,
      width: width - (chairSize + chairMargin) * 2,
      height: height - (chairSize + chairMargin) * 2
    };

    // Draw table with rotation
    this.ctx.save();
    this.ctx.translate(x + width/2, y + height/2);
    this.ctx.rotate(table.rotation);
    this.ctx.translate(-width/2, -height/2);

    // Draw table background in black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(
      chairSize + chairMargin,
      chairSize + chairMargin,
      width - (chairSize + chairMargin) * 2,
      height - (chairSize + chairMargin) * 2
    );
    
    // Draw the table border
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      chairSize + chairMargin,
      chairSize + chairMargin,
      width - (chairSize + chairMargin) * 2,
      height - (chairSize + chairMargin) * 2
    );

    // Draw chairs based on capacity
    const chairsPerSide = Math.ceil(table.capacity / 2);
    const chairSpacing = (width - (chairSize + chairMargin) * 2) / (chairsPerSide + 1);
    
    // Draw top chairs
    for (let i = 0; i < chairsPerSide; i++) {
      const chairX = chairSize + chairMargin + chairSpacing * (i + 1) - chairSize/2;
      this.ctx.save();
      this.ctx.translate(chairX + chairSize/2, chairSize/2);
      this.ctx.rotate(Math.PI);
      this.ctx.drawImage(
        this.chairImage,
        -chairSize/2,
        -chairSize/2,
        chairSize,
        chairSize
      );
      this.ctx.restore();
    }
    
    // Draw bottom chairs
    for (let i = 0; i < table.capacity - chairsPerSide; i++) {
      const chairX = chairSize + chairMargin + chairSpacing * (i + 1) - chairSize/2;
      this.ctx.drawImage(
        this.chairImage,
        chairX,
        height - chairSize - chairMargin,
        chairSize,
        chairSize
      );
    }
    
    this.ctx.restore();

    // Draw rotation handle
    this.drawRotateHandle(table);
  }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tables
    this.tables.forEach(table => this.drawTable(table));
  }

  private getTableBorderColor(status: TableStatus): string {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'reserved': return '#FFC107';
      case 'occupied': return '#f44336';
    }
  }

  private onMouseDown(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // First check if we're clicking any rotation handle
    for (const table of this.tables) {
      if (this.isOverRotateHandle(table, x, y)) {
        this.selectedTable = table;
        this.isRotating = true;
        const centerX = table.position.x + table.width/2;
        const centerY = table.position.y + table.height/2;
        this.rotationStart = Math.atan2(y - centerY, x - centerX) - table.rotation;
        this.draw();
        return;
      }
    }

    // If not on rotation handle, check for table selection/dragging
    const clickedTable = this.tables.find(table => 
      x >= table.position.x &&
      x <= table.position.x + table.width &&
      y >= table.position.y &&
      y <= table.position.y + table.height
    );

    if (clickedTable) {
      this.selectedTable = clickedTable;
      this.isDragging = true;
      this.dragStartX = x - clickedTable.position.x;
      this.dragStartY = y - clickedTable.position.y;
      this.draw(); // Redraw to show rotation handle
    } else {
      // Only deselect if we didn't click a rotation handle or table
      this.selectedTable = null;
      this.isDragging = false;
      this.draw(); // Redraw to hide rotation handle
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.selectedTable) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isRotating) {
      const centerX = this.selectedTable.position.x + this.selectedTable.width/2;
      const centerY = this.selectedTable.position.y + this.selectedTable.height/2;
      const angle = Math.atan2(y - centerY, x - centerX);
      this.selectedTable.rotation = angle - this.rotationStart;
      this.draw();
      return;
    }

    if (this.isDragging) {
      this.selectedTable.position.x = x - this.dragStartX;
      this.selectedTable.position.y = y - this.dragStartY;

      // Keep table within canvas bounds
      this.selectedTable.position.x = Math.max(0, Math.min(this.selectedTable.position.x, 
        this.canvasRef.nativeElement.width - this.selectedTable.width));
      this.selectedTable.position.y = Math.max(0, Math.min(this.selectedTable.position.y, 
        this.canvasRef.nativeElement.height - this.selectedTable.height));

      this.draw();
    }
  }

  private onMouseUp() {
    this.isDragging = false;
    this.isRotating = false;
    this.selectedTable = null;
  }

  onTableClick(table: Table) {
    if (table.status === 'available') table.status = 'reserved';
    else if (table.status === 'reserved') table.status = 'occupied';
    else table.status = 'available';
    this.draw();
  }

  saveLayout() {
    localStorage.setItem('tableLayout', JSON.stringify(this.tables));
  }

  loadLayout() {
    const savedLayout = localStorage.getItem('tableLayout');
    if (savedLayout) {
      this.tables = JSON.parse(savedLayout);
    }
    if (this.ctx) {
      this.draw();
    }
  }

  clearLayout() {
    this.tables = [];
    this.draw();
  }
}

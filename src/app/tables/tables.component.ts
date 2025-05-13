import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaveLayoutDialogComponent } from './save-layout-dialog/save-layout-dialog.component';
import { SaveSuccessSnackbarComponent } from '../shared/save-success-snackbar/save-success-snackbar.component';
import { ClearLayoutDialogComponent } from './clear-layout-dialog/clear-layout-dialog.component';
import { ClearSuccessSnackbarComponent } from '../shared/clear-success-snackbar/clear-success-snackbar.component';

interface Position {
  x: number;
  y: number;
}

interface Table {
  id: number;
  capacity: number;
  position: Position;
  width: number;
  height: number;
  rotation: number;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss',
})
export class TablesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private tableImage: HTMLImageElement;
  private chairImage: HTMLImageElement;
  private rotateImage: HTMLImageElement;
  private imagesLoaded = 0;
  private readonly ROTATE_HANDLE_SIZE = 20;

  tables: Table[] = [];
  newTable = {
    capacity: 4,
  };

  selectedTable: Table | null = null;
  isDragging = false;
  isRotating = false;
  dragStartX = 0;
  dragStartY = 0;
  rotationStart = 0;

  // Add history tracking
  private history: Table[][] = [];
  private currentHistoryIndex = -1;
  public canUndo = false;
  public canRedo = false;

  private resizeObserver: ResizeObserver;

  validateKeyPress(event: KeyboardEvent): boolean {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    }
    return event.charCode >= 49 && event.charCode <= 56;
  }

  validateCapacity(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.value === '') {
      return;
    }

    let value = parseInt(input.value);

    if (isNaN(value)) {
      return;
    }

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

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {
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

    // Initialize ResizeObserver
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize();
    });
  }

  private getTableDimensions(capacity: number): {
    width: number;
    height: number;
  } {
    if (capacity <= 2) return { width: 100, height: 120 };
    if (capacity <= 3) return { width: 120, height: 140 };
    if (capacity <= 5) return { width: 120, height: 160 };
    return { width: 160, height: 180 };
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const container = canvas.parentElement;
    if (container) {
      this.resizeObserver.observe(container);
    }

    this.updateCanvasSize();
    this.loadLayout();

    this.saveToHistory();

    if (this.imagesLoaded === 3) this.draw();

    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  ngOnDestroy() {
    // Clean up the ResizeObserver
    this.resizeObserver.disconnect();
  }

  private updateCanvasSize() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    // Get the container's size
    const rect = container.getBoundingClientRect();

    // Set the canvas size to match the container
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Redraw the canvas with the new size
    this.draw();
  }

  private drawRotateHandle(table: Table) {
    if (this.selectedTable !== table) return;

    const handleX =
      table.position.x + table.width - this.ROTATE_HANDLE_SIZE / 2;
    const handleY = table.position.y - this.ROTATE_HANDLE_SIZE / 2;

    this.ctx.save();
    this.ctx.translate(
      handleX + this.ROTATE_HANDLE_SIZE / 2,
      handleY + this.ROTATE_HANDLE_SIZE / 2
    );
    this.ctx.rotate(table.rotation);
    this.ctx.drawImage(
      this.rotateImage,
      -this.ROTATE_HANDLE_SIZE / 2,
      -this.ROTATE_HANDLE_SIZE / 2,
      this.ROTATE_HANDLE_SIZE,
      this.ROTATE_HANDLE_SIZE
    );
    this.ctx.restore();
  }

  private isOverRotateHandle(table: Table, x: number, y: number): boolean {
    const handleX =
      table.position.x + table.width - this.ROTATE_HANDLE_SIZE / 2;
    const handleY = table.position.y - this.ROTATE_HANDLE_SIZE / 2;

    return (
      x >= handleX &&
      x <= handleX + this.ROTATE_HANDLE_SIZE &&
      y >= handleY &&
      y <= handleY + this.ROTATE_HANDLE_SIZE
    );
  }

  private saveToHistory() {
    const newState = JSON.stringify(this.tables);
    const lastState = this.history[this.currentHistoryIndex]
      ? JSON.stringify(this.history[this.currentHistoryIndex])
      : null;

    if (newState === lastState) return;

    this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    this.history.push(JSON.parse(newState));
    this.currentHistoryIndex++;

    this.canUndo = this.currentHistoryIndex > 0;
    this.canRedo = false;
  }

  undo() {
    if (this.canUndo) {
      this.currentHistoryIndex--;
      this.tables = JSON.parse(
        JSON.stringify(this.history[this.currentHistoryIndex])
      );
      this.canUndo = this.currentHistoryIndex > 0;
      this.canRedo = true;
      this.draw();
    }
  }

  redo() {
    if (this.canRedo) {
      this.currentHistoryIndex++;
      this.tables = JSON.parse(
        JSON.stringify(this.history[this.currentHistoryIndex])
      );
      this.canUndo = true;
      this.canRedo = this.currentHistoryIndex < this.history.length - 1;
      this.draw();
    }
  }

  addTable() {
    const capacity = Math.min(
      Math.max(1, Math.floor(this.newTable.capacity)),
      8
    );
    const dimensions = this.getTableDimensions(capacity);
    const table: Table = {
      id: this.tables.length + 1,
      capacity: capacity,
      position: { x: 50, y: 50 },
      rotation: 0,
      ...dimensions,
    };

    this.tables.push(table);
    this.saveToHistory();
    this.draw();
  }

  private drawTable(table: Table) {
    const x = table.position.x;
    const y = table.position.y;
    const { width, height } = table;
    const chairSize = 24;
    const chairMargin = 5;

    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(table.rotation);
    this.ctx.translate(-width / 2, -height / 2);

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(
      chairSize + chairMargin,
      chairSize + chairMargin,
      width - (chairSize + chairMargin) * 2,
      height - (chairSize + chairMargin) * 2
    );

    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      chairSize + chairMargin,
      chairSize + chairMargin,
      width - (chairSize + chairMargin) * 2,
      height - (chairSize + chairMargin) * 2
    );

    const chairsPerSide = Math.ceil(table.capacity / 2);
    const chairSpacing =
      (width - (chairSize + chairMargin) * 2) / (chairsPerSide + 1);

    for (let i = 0; i < chairsPerSide; i++) {
      const chairX =
        chairSize + chairMargin + chairSpacing * (i + 1) - chairSize / 2;
      this.ctx.save();
      this.ctx.translate(chairX + chairSize / 2, chairSize / 2);
      this.ctx.rotate(Math.PI);
      this.ctx.drawImage(
        this.chairImage,
        -chairSize / 2,
        -chairSize / 2,
        chairSize,
        chairSize
      );
      this.ctx.restore();
    }

    for (let i = 0; i < table.capacity - chairsPerSide; i++) {
      const chairX =
        chairSize + chairMargin + chairSpacing * (i + 1) - chairSize / 2;
      this.ctx.drawImage(
        this.chairImage,
        chairX,
        height - chairSize - chairMargin,
        chairSize,
        chairSize
      );
    }

    this.ctx.restore();

    this.drawRotateHandle(table);
  }

  private draw() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.tables.forEach((table) => this.drawTable(table));
  }

  private onMouseDown(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const table of this.tables) {
      if (this.isOverRotateHandle(table, x, y)) {
        this.selectedTable = table;
        this.isRotating = true;
        const centerX = table.position.x + table.width / 2;
        const centerY = table.position.y + table.height / 2;
        this.rotationStart =
          Math.atan2(y - centerY, x - centerX) - table.rotation;
        this.draw();
        return;
      }
    }

    const clickedTable = this.tables.find(
      (table) =>
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
      this.draw();
    } else {
      this.selectedTable = null;
      this.isDragging = false;
      this.draw();
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.selectedTable) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isRotating) {
      const centerX =
        this.selectedTable.position.x + this.selectedTable.width / 2;
      const centerY =
        this.selectedTable.position.y + this.selectedTable.height / 2;
      const angle = Math.atan2(y - centerY, x - centerX);
      this.selectedTable.rotation = angle - this.rotationStart;
      this.draw();
      return;
    }

    if (this.isDragging) {
      this.selectedTable.position.x = x - this.dragStartX;
      this.selectedTable.position.y = y - this.dragStartY;

      this.selectedTable.position.x = Math.max(
        0,
        Math.min(
          this.selectedTable.position.x,
          this.canvasRef.nativeElement.width - this.selectedTable.width
        )
      );
      this.selectedTable.position.y = Math.max(
        0,
        Math.min(
          this.selectedTable.position.y,
          this.canvasRef.nativeElement.height - this.selectedTable.height
        )
      );

      this.draw();
    }
  }

  private onMouseUp() {
    if (this.isDragging || this.isRotating) {
      this.saveToHistory();
    }
    this.isDragging = false;
    this.isRotating = false;
  }

  saveLayout() {
    const dialogRef = this.dialog.open(SaveLayoutDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        localStorage.setItem('tableLayout', JSON.stringify(this.tables));
        this.showSaveSuccess();
      }
    });
    this.canUndo = false;
    this.canRedo = false;
  }

  private showSaveSuccess(): void {
    this.snackBar.openFromComponent(SaveSuccessSnackbarComponent, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'success-snackbar',
    });
  }

  private showClearSuccess(): void {
    this.snackBar.openFromComponent(ClearSuccessSnackbarComponent, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'success-snackbar',
    });
  }

  loadLayout() {
    const savedLayout = localStorage.getItem('tableLayout');
    if (savedLayout) {
      this.tables = JSON.parse(savedLayout);
      this.draw();
      console.log('Layout loaded successfully');
    }
  }

  clearLayout() {
    const dialogRef = this.dialog.open(ClearLayoutDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        localStorage.removeItem('tableLayout');
        this.tables = [];
        this.saveToHistory();
        this.draw();
        this.showClearSuccess();

        this.canRedo = false;
        this.canUndo = false;
      }
    });
  }
}

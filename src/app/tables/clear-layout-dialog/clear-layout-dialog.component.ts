import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'



@Component({
  selector: 'app-clear-layout-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './clear-layout-dialog.component.html',
  styleUrl: './clear-layout-dialog.component.scss'
})
export class ClearLayoutDialogComponent {
  constructor(private dialogRef: MatDialogRef<ClearLayoutDialogComponent>) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-save-layout-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    templateUrl: './save-layout-dialog.component.html',
    styleUrls: ['./save-layout-dialog.component.scss']
})
export class SaveLayoutDialogComponent {
    constructor(private dialogRef: MatDialogRef<SaveLayoutDialogComponent>) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
} 
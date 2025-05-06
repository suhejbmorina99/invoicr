import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-save-success-snackbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="success-container" [@slideInOut]>
      <mat-icon class="success-icon" [@scaleIn]>check_circle</mat-icon>
      <span class="success-message">Layout saved successfully!</span>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #4CAF50;
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .success-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .success-message {
      font-size: 16px;
      font-weight: 500;
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('400ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class SaveSuccessSnackbarComponent {} 
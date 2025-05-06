import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-save-success-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-success-snackbar.component.html',
  styleUrls: ['./save-success-snackbar.component.scss'],
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
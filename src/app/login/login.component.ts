import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dbe-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  pin: string = '';
  maxPinLength = 4;
  dots: boolean[] = Array(this.maxPinLength).fill(false);
  selectedUser: string | null = null;
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onUserSelect(user: string) {
    this.selectedUser = user;
    this.clearPin();
  }

  onPinButtonClick(number: string) {
    if (this.selectedUser && this.pin.length < this.maxPinLength) {
      this.pin += number;
      this.updateDots();

      // If pin is complete, try to login
      if (this.pin.length === this.maxPinLength) {
        this.login();
      }
    }
  }

  clearPin() {
    this.pin = '';
    this.errorMessage = '';
    this.updateDots();
  }

  private login() {
    if (this.selectedUser && this.pin) {
      const success = this.authService.login(this.selectedUser, this.pin);
      if (!success) {
        this.errorMessage = 'Invalid PIN';
        this.clearPin();
      }
    }
  }

  private updateDots() {
    this.dots = this.pin.split('').map(() => true);
    while (this.dots.length < this.maxPinLength) {
      this.dots.push(false);
    }
  }
}

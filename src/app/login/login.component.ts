import { Component } from '@angular/core';

@Component({
  selector: 'dbe-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  pin: string = '';
  maxPinLength = 4;
  dots: boolean[] = Array(this.maxPinLength).fill(false);

  onPinButtonClick(number: string) {
    if (this.pin.length < this.maxPinLength) {
      this.pin += number;
      this.updateDots();
    }
  }

  private updateDots() {
    this.dots = this.pin.split('').map(() => true);
    while (this.dots.length < this.maxPinLength) {
      this.dots.push(false);
    }
  }
}

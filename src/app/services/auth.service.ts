import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface User {
  type: string;
  pin: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [
    { type: 'waiter', pin: '1234' },
    { type: 'manager', pin: '5678' },
    { type: 'admin', pin: '0000' }
  ];

  private currentUser = new BehaviorSubject<User | null>(null);
  private readonly STORAGE_KEY = 'currentUser';

  constructor(private router: Router) {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const savedUser = localStorage.getItem(this.STORAGE_KEY);
    if (savedUser) {
      this.currentUser.next(JSON.parse(savedUser));
    } else {
      this.router.navigate(['/login']);
    }
  }

  login(userType: string, pin: string): boolean {
    const user = this.users.find(u => u.type === userType && u.pin === pin);
    if (user) {
      this.currentUser.next(user);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.router.navigate(['/tables']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }
} 
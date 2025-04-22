import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  type: 'waiter' | 'manager' | 'admin';
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

  private currentUser: User | null = null;

  constructor(private router: Router) {}

  login(userType: string, pin: string): boolean {
    const user = this.users.find(u => u.type === userType && u.pin === pin);
    if (user) {
      this.currentUser = user;
      this.router.navigate(['/tables']);
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
} 
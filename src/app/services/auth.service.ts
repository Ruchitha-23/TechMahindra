import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'taskmanager_users';
  private readonly CURRENT_USER_KEY = 'taskmanager_current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  signup(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    return new Observable(subscriber => {
      try {
        if (!this.isBrowser) {
          subscriber.error(new Error('This operation is only available in browser environment'));
          return;
        }

        const users = this.getUsers();
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
          subscriber.error(new Error('User with this email already exists'));
          return;
        }

        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        this.currentUserSubject.next(newUser);
        this.isAuthenticatedSubject.next(true);
        subscriber.next(newUser);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  login(email: string, password: string): Observable<User> {
    return new Observable(subscriber => {
      try {
        if (!this.isBrowser) {
          subscriber.error(new Error('This operation is only available in browser environment'));
          return;
        }

        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          subscriber.error(new Error('Invalid email or password'));
          return;
        }

        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        subscriber.next(user);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private getUsers(): User[] {
    if (!this.isBrowser) {
      return [];
    }
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Helper method to get all users (for development/testing)
  getAllUsers(): User[] {
    return this.getUsers();
  }
} 